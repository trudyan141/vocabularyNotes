import {saveExtensionProposal} from './extensions';
import {extensionDraftSchema,type ExtensionDraft} from '@/lib/learning/extensions';
import {validateMedia,saveMedia} from './media';
import {remoteTransactions as sharedHydrations} from '@/data/cloud/notifications';
import type {MediaAsset} from '@/lib/media/contracts';
import {contentSchema,saveContent,type LearningContent} from './content';
import {safeArt} from '@/lib/media/catalog';
import {withoutWordMemberships,aggregateWordId,aggregateTagPrefix,groupLibraryWords,libraryWordMatcher} from '@/lib/learning/library-search';
import { Dexie } from "dexie";
import { z } from "zod";
import {
  canonicalKey,
  contentHash,
  exactSenseKey,
  searchTerms,
  stableJson,
} from "@/domain/identity";
import {
  demoCandidates,
  demoEntries,
  validCandidate,
  type Candidate,
  type DemoEntry,
} from "@/lib/demo/model";
import { catalog } from "@/lib/learning/catalog";
import { LibraryDatabase } from "./database";
import {librarySearchStore} from './library-search-store';
import type {
  Base,
  Sense,
  Lexeme,
  SearchRow,
  LibraryWord,
  Note,
  ReviewEvent,
  SaveResult,
  Scope,
  SearchResult,
  WordInput,
} from "./types";
export type LibrarySearchProjection={scopeId:string;rows:SearchRow[];senses:Sense[];senseById:Map<string,Sense>;entries:Map<string,Lexeme>};
const text = (max: number) => z.string().trim().min(1).max(max);
const pronunciationSchema = z.object({
  text: text(2000), contentVersion: z.number().int().positive(),
  accent: z.enum(["UK", "US", "other"]), ipa: z.string().max(2000).nullable(),
  sourceUrl: z.string().max(2000).nullable(), verified: z.boolean(),
  readingHintVi: z.string().max(2000).nullable(), origin: z.enum(["source", "user", "ai_generated"]),
  approvedContentVersion: z.number().int().positive().nullable(),
}).strict();
const inputSchema = z
  .object({
    id: text(100),
    word: text(200),
    vi: z.string().max(1000),
    en: z.string().max(1000),
    example: z.string().max(2000),
    exampleVi: z.string().max(2000),
    art: z.string().max(100).nullable(),
    lesson: text(100),
    pos: text(60),
    sense: text(200),
    ready: z.boolean(),
    source: z.string().max(2000),
    caseMode: z.enum(["fold", "exact"]).optional(),
    origin: z.enum(["demo", "user", "source", "ai_generated"]).optional(),
    approved: z.boolean().optional(),
    sourceEvidenceText: z.string().max(2500).optional(),
    tags: z.array(text(100)).max(30).optional(),
    pronunciations: z.array(pronunciationSchema).max(4).optional(),
    examplePronunciations: z.array(pronunciationSchema).max(4).optional(),
    additionalExamples:z.array(z.object({textEn:text(2000),translationVi:text(2000),pronunciations:z.array(pronunciationSchema).max(4)}).strict()).max(1).optional(),
  })
  .strict();
export const candidateSchema = inputSchema
  .omit({
    additionalExamples:true,
    caseMode: true,
    origin: true,
    approved: true,
    sourceEvidenceText: true,
    tags: true,
    pronunciations: true,
    examplePronunciations: true,
  })
  .extend({
    text: text(200),
    selected: z.boolean(),
    uncertain: z.boolean(),
    existing: z.boolean(),
    confirmed: z.boolean().optional(),
  });
export class RepositoryError extends Error {
  constructor(
    public code: "conflict" | "invalid" | "missing" | "scope" | "not-ready" | "complete",
  ) {
    super(code);
  }
}
function scopeCheck(scope: Scope) {
  if (scope.kind === "account") {
    if (
      scope.id !== `account:${scope.ownerId}:${scope.libraryId}` ||
      !scope.ownerId ||
      !scope.libraryId
    )
      throw new RepositoryError("scope");
  } else if (
    !scope.id.startsWith(`${scope.kind}:`) ||
    !scope.id.slice(scope.kind.length + 1)
  )
    throw new RepositoryError("scope");
}
function base(scopeId: string, id = crypto.randomUUID()): Base {
  const at = new Date().toISOString();
  return {
    scopeId,
    id,
    createdAt: at,
    updatedAt: at,
    version: 1,
    deletedAt: null,
  };
}
export class LocalRepository {
  private searchStore:ReturnType<typeof librarySearchStore>|undefined;
  librarySearchStore(){return this.searchStore??=librarySearchStore(this);}
  releaseLibrarySearch(){this.searchStore?.dispose();}
  accessValid=true;
  private leaseDeadline=Infinity;
  get readOnly(){return this.scope.kind==='shared';}
  get remainingLeaseMs(){return Math.max(0,this.leaseDeadline-performance.now());}
  get canPractice(){return this.accessValid&&performance.now()<this.leaseDeadline;}
  assertContentWritable(){if(this.readOnly)throw new RepositoryError('scope');}
  constructor(
    public readonly db: LibraryDatabase,
    public readonly scope: Scope,
  ) {
    scopeCheck(scope);
    if(scope.kind==='shared'){
      if(scope.id!==`shared:${scope.access.id}:${scope.libraryId}`||scope.ownerId!==scope.access.ownerId||scope.libraryId!==scope.access.libraryId)throw new RepositoryError('scope');
      if(scope.access.expiresAt)this.leaseDeadline=performance.now()+Math.max(0,Date.parse(scope.access.expiresAt)-Date.parse(scope.access.serverTime));
      this.installSharedGuards();
    }
  }
  private installSharedGuards(){
    const content=new Set(['entries','senses','examples','lessons','lessonItems','evidence','notes','decks','sentences','mediaAssets','surfaceForms','patterns','grammarItems','sourceAssets','deckItems','captureDrafts','localMedia','learningDrafts','drafts','receipts','learningExtensions']);
    const learning=new Set(['practiceCycles','practiceSessions','reviewEvents','gameAttempts','reviewStates']);
    for(const table of this.db.tables){
      if(!content.has(table.name)&&!learning.has(table.name))continue;
      const check=(row:{scopeId?:string},tx:import('dexie').Transaction)=>{
        if(row.scopeId!==this.scope.id||sharedHydrations.has(tx))return;
        if(content.has(table.name))this.assertContentWritable();
        else if(!this.canPractice)throw new RepositoryError('not-ready');
      };
      table.hook('creating',(_key,row,tx)=>check(row,tx));
      table.hook('updating',(_changes,_key,row,tx)=>check(row,tx));
      table.hook('deleting',(_key,row,tx)=>check(row,tx));
    }
  }
  private async journal(
    entity: string,
    id: string,
    payload: Record<string, unknown>,
  ) {
    if (this.scope.kind === "account")
      await this.db.outbox.add({
        ...base(this.scope.id),
        payload: {
          entity,
          id,
          ownerId: this.scope.ownerId,
          libraryId: this.scope.libraryId,
          ...payload,
        },
      });
  }
  async words(ids: string[]): Promise<LibraryWord[]> {
    return this.db.transaction(
      "r",
      [this.db.entries,this.db.senses,this.db.examples,this.db.lessonItems,this.db.lessons,this.db.table("decks"),this.db.table("mediaAssets")],
      () => this.readWords(ids),
    );
  }
  private async readWords(ids: string[]): Promise<LibraryWord[]> {
    if (!ids.length) return [];
    // Membership aliases need this scoped projection too. Reuse one bulk read
    // instead of issuing an IDB get for every word in a large practice pool.
    const pool=ids.length>100?await this.db.senses.where('[scopeId+id]').between([this.scope.id,''],[this.scope.id,'\uffff']).toArray():null;
    const senseById=pool?new Map(pool.map(sense=>[sense.id,sense])):null;
    const senses=senseById?ids.map(id=>senseById.get(id)):await this.db.senses.bulkGet(ids.map(id=>[this.scope.id,id]));
    const entryIds=[...new Set(senses.flatMap(s=>s?[s.entryId]:[]))];
    const allSenses=pool??await this.db.senses.where('[scopeId+entryId]').anyOf(entryIds.map(id=>[this.scope.id,id])).toArray();
    const [lexemes, examples, links] = await Promise.all([
      entryIds.length>100
        ? this.db.entries.where('[scopeId+id]').between([this.scope.id,''],[this.scope.id,'\uffff']).toArray()
        : this.db.entries.bulkGet(entryIds.map(id=>[this.scope.id,id])),
      this.db.examples
        .where("[scopeId+senseId]")
        .anyOf(ids.map((id) => [this.scope.id, id]))
        .toArray(),
      this.db.lessonItems
        .where("[scopeId+senseId]")
        .anyOf(ids.map((id) => [this.scope.id, id]))
        .toArray(),
    ]);
    const entries = new Map(
      lexemes.flatMap((e) => (e ? [[e.id, e] as const] : [])),
    );
    const [allLinks,allLessons,allDecks]=await Promise.all([
      this.db.lessonItems.where('[scopeId+senseId]').anyOf(allSenses.map(sense=>[this.scope.id,sense.id])).toArray(),
      this.db.lessons.where('[scopeId+id]').between([this.scope.id,''],[this.scope.id,'\uffff']).toArray(),
      this.db.table<import('./types').ScopedDocument>('decks').where('[scopeId+id]').between([this.scope.id,''],[this.scope.id,'\uffff']).toArray(),
    ]);
    const aggregateKey=(sense:Sense)=>JSON.stringify([sense.entryId,sense.pos,aggregateWordId(sense)]);
    const aliases=new Map<string,string[]>();for(const sense of allSenses){if(sense.deletedAt)continue;const key=aggregateKey(sense),ids=aliases.get(key)??[];ids.push(sense.id);aliases.set(key,ids);}
    const groupBySource=new Map<string,{id:string;name:string}[]>();for(const row of allDecks){const deck=row.payload.deck as import('./decks').Deck;if(row.deletedAt||!deck?.group)continue;for(const id of deck.senseIds){const groups=groupBySource.get(id)??[];groups.push({id:row.id,name:deck.name});groupBySource.set(id,groups);}}
    const lessonsById=new Map(allLessons.filter(lesson=>!lesson.deletedAt).map(lesson=>[lesson.id,lesson]));
    const lessonBySource=new Map<string,{id:string;name:string}[]>();for(const link of allLinks){const lesson=lessonsById.get(link.lessonId);if(link.deletedAt||!lesson)continue;const lessons=lessonBySource.get(link.senseId)??[];lessons.push({id:lesson.id,name:lesson.title});lessonBySource.set(link.senseId,lessons);}
    const memberships=(sense:Sense)=>{const ids=aliases.get(aggregateKey(sense))??[sense.id];return {
      groupMemberships:[...new Map(ids.flatMap(id=>groupBySource.get(id)??[]).map(group=>[group.id,group])).values()],
      lessonMemberships:[...new Map(ids.flatMap(id=>lessonBySource.get(id)??[]).map(lesson=>[lesson.id,lesson])).values()],
    };};
    const firstExamples = new Map<string, (typeof examples)[number]>();
    const firstLessons = new Map<string, string>();
    for (const e of examples.sort((a,b)=>(a.position??0)-(b.position??0)||a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id)))
      if (!e.deletedAt && !firstExamples.has(e.senseId))
        firstExamples.set(e.senseId, e);
    for (const l of links)
      if (!l.deletedAt && !firstLessons.has(l.senseId))
        firstLessons.set(l.senseId, l.lessonId);
    const mediaIds=senses.flatMap(s=>s?.art?.startsWith('media-')?[s.art]:[]);
    const mediaRows=mediaIds.length?await this.db.table('mediaAssets').bulkGet(mediaIds.map(id=>[this.scope.id,id])):[];
    const media=new Map(mediaRows.filter(Boolean).map(row=>[row.id,row]));
    return senses.flatMap((s) => {
      if (!s || s.deletedAt) return [];
      const e = entries.get(s.entryId);
      if (!e || e.deletedAt) return [];
      const example = firstExamples.get(s.id);
      return [
        {
          id: s.id,
          ...memberships(s),
          word: e.displayText,
          vi: s.meaningVi,
          en: s.definitionEn,
          pos: s.pos,
          sense: s.senseLabel,
          art: s.art?.startsWith('media-')?(()=>{const row=media.get(s.art),asset=row?.payload.asset;return !row?.deletedAt&&asset?.approved&&asset.status==='ready'&&asset.senseId===s.id&&asset.word===e.displayText&&asset.revision===`${e.version}:${s.version}`?s.art:null;})():s.art,
          example: example?.textEn ?? "",
          exampleVi: example?.translationVi ?? "",
          lesson: firstLessons.get(s.id) ?? "manual",
          ready: s.contentStatus === "complete",
          source: s.source,
          origin: s.origin,
          pendingEdit: s.pendingEdit,
          revision: `${e.version}:${s.version}`,
          caseMode: e.caseMode,
          approved:
            s.learningApprovalStatus === "approved" &&
            s.approvedContentVersion === s.contentVersion,
          tags: s.tags,
          pronunciations: s.pronunciations ?? [],
          examplePronunciations: example?.pronunciations ?? [],
        },
      ];
    });
  }
  async word(id: string) {
    return (await this.words([id]))[0];
  }
  /** A liveQuery-owned read projection. No global cache or persistent derived data. */
  async librarySearchProjection():Promise<LibrarySearchProjection>{
    const scope=this.scope.id;
    return this.db.transaction('r',[this.db.searchIndex,this.db.senses,this.db.entries],async()=>{
      const [rows,senses,entries]=await Promise.all([
        this.db.searchIndex.where('[scopeId+ordinal]').between([scope,''],[scope,'\uffff']).toArray(),
        this.db.senses.where('[scopeId+id]').between([scope,''],[scope,'\uffff']).toArray(),
        this.db.entries.where('[scopeId+id]').between([scope,''],[scope,'\uffff']).toArray(),
      ]);
      return {scopeId:scope,rows,senses,senseById:new Map(senses.map(sense=>[sense.id,sense])),entries:new Map(entries.filter(entry=>!entry.deletedAt).map(entry=>[entry.id,entry]))};
    });
  }
  async search(
    query: string,
    options: {
      lesson?: string | null;
      missingArt?: boolean;
      excludeIds?: string[];
      offset?: number;
      limit?: number;
      approvedOnly?: boolean;
      libraryOnly?: boolean;
      aggregateOnly?: boolean;
    } = {},
    projection?:LibrarySearchProjection,
  ): Promise<SearchResult> {
    return this.db.transaction(
      "r",
      [this.db.entries,this.db.senses,this.db.examples,this.db.lessonItems,this.db.searchIndex,this.db.lessons,this.db.table("decks"),this.db.table("mediaAssets")],
      () => this.readSearch(query, options,projection),
    );
  }
  async matchingApprovedWordIds(query: string,aggregateOnly=false): Promise<string[]> {
    if(aggregateOnly){const rows=await this.db.searchIndex.where('[scopeId+ordinal]').between([this.scope.id,''],[this.scope.id,'\uffff']).filter(row=>row.approval&&(!query.trim()||row.terms.includes(searchTerms(query)))).toArray();const senses=await this.db.senses.bulkGet(rows.map(row=>[this.scope.id,row.id]));const groups=new Map<string,string>();for(const sense of senses){if(!sense||sense.deletedAt)continue;const key=JSON.stringify([sense.entryId,sense.pos,aggregateWordId(sense)]);if(!groups.has(key)||sense.id===aggregateWordId(sense))groups.set(key,sense.id);}return [...groups.values()];}
    const needle = searchTerms(query);
    return this.db.searchIndex.where("[scopeId+ordinal]")
      .between([this.scope.id, Dexie.minKey], [this.scope.id, Dexie.maxKey])
      .filter(row => row.approval && (!needle || row.terms.includes(needle)))
      .primaryKeys().then(keys => keys.map(key => key[1] as string));
  }
  private async readSearch(
    query: string,
    options: {
      lesson?: string | null;
      missingArt?: boolean;
      excludeIds?: string[];
      offset?: number;
      limit?: number;
      approvedOnly?: boolean;
      libraryOnly?: boolean;
      aggregateOnly?: boolean;
    } = {},
    projection?:LibrarySearchProjection,
  ): Promise<SearchResult> {
    const needle = searchTerms(query);
    const projected=options.libraryOnly&&projection?.scopeId===this.scope.id?projection:undefined;
    const rows = projected?.rows??await this.db.searchIndex
      .where("[scopeId+ordinal]")
      .between([this.scope.id, Dexie.minKey], [this.scope.id, Dexie.maxKey])
      .toArray();
    const source = rows.filter((r) => !options.approvedOnly || r.approval);
    const excluded=new Set(options.excludeIds??[]);
    if(options.libraryOnly){
      const eligible=source.filter(r=>(!options.lesson||r.lessonIds.includes(options.lesson))&&(!options.missingArt||!r.art)&&!excluded.has(r.id));
      const lookup=projected??await this.librarySearchProjection();
      const allSenses=lookup.senses,senseById=lookup.senseById;
      const senses=eligible.map(row=>senseById.get(row.id));
      const entries=lookup.entries;
      const matches=libraryWordMatcher(query);
      const grouped=new Map<string,string[]>();
      for(const sense of senses){if(!sense||sense.deletedAt)continue;const entry=entries.get(sense.entryId);if(!entry||!matches({word:entry.displayText,vi:sense.meaningVi}))continue;const key=JSON.stringify([canonicalKey(entry.displayText,entry.caseMode),entry.caseMode]);const ids=grouped.get(key)??[];ids.push(sense.id);grouped.set(key,ids);}
      const limit=Math.max(1,Math.min(options.limit??50,100)),offset=Math.max(0,options.offset??0);
      // Hydrate examples/media only for the visible page, after grouping and filtering.
      const sourceIds=new Set(source.map(row=>row.id));
      const totalLibrary=new Set(allSenses.filter(sense=>!sense.deletedAt&&sourceIds.has(sense.id)).map(sense=>JSON.stringify([sense.entryId,sense.pos,aggregateWordId(sense)]))).size;
      return {words:groupLibraryWords(await this.words([...grouped.values()].slice(offset,offset+limit).flat()),!options.lesson),total:grouped.size,totalLibrary};
    }
    const matches = source.filter(
      (r) =>
        (!needle || r.terms.includes(needle)) &&
        (!options.lesson || r.lessonIds.includes(options.lesson)) &&
        (!options.missingArt || !r.art) &&
        !excluded.has(r.id),
    );
    let ids=matches.map(row=>row.id);
    if(options.aggregateOnly){const senses=await this.db.senses.bulkGet(ids.map(id=>[this.scope.id,id]));const groups=new Map<string,string>();for(const sense of senses){if(!sense||sense.deletedAt)continue;const key=JSON.stringify([sense.entryId,sense.pos,aggregateWordId(sense)]);if(!groups.has(key)||sense.id===aggregateWordId(sense))groups.set(key,sense.id);}ids=[...groups.values()];}
    const limit = Math.max(1, Math.min(options.limit ?? 50, 100));
    const offset = Math.max(0, options.offset ?? 0);
    return {
      words: await this.words(
        ids.slice(offset,offset+limit),
      ),
      total: ids.length,
      totalLibrary: source.length,
    };
  }

  private async reindex(senseId: string) {
    const s = await this.db.senses.get([this.scope.id, senseId]);
    if (!s) return;
    const e = await this.db.entries.get([this.scope.id, s.entryId]);
    if (!e || s.deletedAt || e.deletedAt) {
      await this.db.searchIndex.delete([this.scope.id, senseId]);
      return;
    }
    const [examples, links] = await Promise.all([
      this.db.examples
        .where("[scopeId+senseId]")
        .equals([this.scope.id, senseId])
        .toArray(),
      this.db.lessonItems
        .where("[scopeId+senseId]")
        .equals([this.scope.id, senseId])
        .toArray(),
    ]);
    const lessons = await this.db.lessons.bulkGet(
      links.map((l) => [this.scope.id, l.lessonId]),
    );
    await this.db.searchIndex.put({
      scopeId: this.scope.id,
      id: s.id,
      terms: searchTerms(
        [
          e.displayText,
          s.meaningVi,
          s.definitionEn,
          s.pos,
          s.senseLabel,
          ...s.tags,
          ...examples
            .filter((x) => !x.deletedAt)
            .map((x) => `${x.textEn} ${x.translationVi}`),
          ...lessons.map((l) => l?.title ?? ""),
        ].join(" "),
      ),
      lessonIds: links.map((l) => l.lessonId),
      art: s.art,
      ordinal: s.createdAt + s.id,
      approval:
        s.learningApprovalStatus === "approved" &&
        s.approvedContentVersion === s.contentVersion,
    });
  }
  async saveLesson(input: {
    operationId: string;
    title: string;
    learnedOn: string;
    captureBatch?:{id:string;signature:string};
    picture?:{wordId:string;asset:MediaAsset};
    pictures?:{wordId:string;asset:MediaAsset}[];
    sourceType: "demo" | "manual" | "image";
    items: WordInput[];
    extensions?:ExtensionDraft[];
    draftId?: string;
    lessonId?: string;
    learning?:{key:string;wordId:string;content:Omit<LearningContent,"senseId"|"targetRevision">}[];
  }) {
    if(input.extensions)z.array(extensionDraftSchema).max(300).parse(input.extensions);
    const items = z.array(inputSchema).min(1).max(10000).parse(input.items);
    text(100).parse(input.operationId);
    text(200).parse(input.title);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(input.learnedOn) ||
      !["demo", "manual", "image"].includes(input.sourceType)
    )
      throw new RepositoryError("invalid");
    if (input.sourceType === "demo" && this.scope.kind !== "demo")
      throw new RepositoryError("scope");
    for(const item of input.learning??[]){text(40).parse(item.key);if(!items.some(word=>word.id===item.wordId))throw new RepositoryError("invalid");contentSchema.parse({...item.content,senseId:item.wordId,targetRevision:"1:1"});}
    if((input.learning?.length??0)>200)throw new RepositoryError("invalid");
    const pictures=[...(input.pictures??[]),...(input.picture?[input.picture]:[])];if(pictures.length>items.length||new Set(pictures.map(row=>row.wordId)).size!==pictures.length)throw new RepositoryError('invalid');
    for(const picture of pictures){const word=items.find(row=>row.id===picture.wordId);if(!word||word.word!==picture.asset.word)throw new RepositoryError('invalid');await validateMedia(picture.asset);}
    const hash = await contentHash({ ...input, items }); // WebCrypto must finish before opening an IDB transaction.
    return this.db.transaction("rw", this.db.tables, async () => {
      const key: [string, string] = [this.scope.id, input.operationId];
      const receipt = await this.db.receipts.get(key);
      if (receipt) {
        if (receipt.payloadHash !== hash) throw new RepositoryError("conflict");
        return receipt.result;
      }
      if(input.captureBatch){
        const rows=(await this.db.captureDrafts.where('[scopeId+updatedAt]').between([this.scope.id,''],[this.scope.id,'\uffff']).toArray()).filter(row=>row.batchId===input.captureBatch!.id).sort((a,b)=>(a.batchOrder??0)-(b.batchOrder??0)||a.createdAt.localeCompare(b.createdAt));
        if(JSON.stringify(rows.map(row=>[row.id,row.version]))!==input.captureBatch.signature)throw new RepositoryError('conflict');
      }
      let lessonId = input.lessonId ?? crypto.randomUUID();
      if(input.sourceType==='manual'&&input.lessonId?.startsWith('manual-day-')){const daily=await this.db.lessons.where('[scopeId+learnedOn]').equals([this.scope.id,input.learnedOn]).toArray();const match=daily.find(l=>!l.deletedAt&&l.sourceType==='manual'&&l.id.startsWith('manual-day-'));if(match)lessonId=match.id;else {const moved=await this.db.lessons.get([this.scope.id,lessonId]);if(moved)lessonId=`manual-day-${input.learnedOn}-${crypto.randomUUID()}`;}}

      const existingLesson = await this.db.lessons.get([
        this.scope.id,
        lessonId,
      ]);
      if (!existingLesson)
        await this.db.lessons.add({
          ...base(this.scope.id, lessonId),
          title: input.title,
          learnedOn: input.learnedOn,
          sourceType: input.sourceType,
          sourceDigest: null,
        });
      const result: SaveResult = {
        added: 0,
        linked: 0,
        addedSenses: 0,
        lessonId,
        operationId: input.operationId,
      };
      const changed = new Set<string>();
      const resolved=new Map<string,{id:string;revision:string}>();
      for (const word of items) {
        const caseMode = word.caseMode ?? "fold";
        const canonical = canonicalKey(word.word, caseMode);
        let entry = await this.db.entries
          .where("[scopeId+language+activeKey+caseMode]")
          .equals([this.scope.id, "en", canonical, caseMode])
          .first();
        const lexemeExists = !!entry;
        if (!entry) {
          entry = {
            ...base(this.scope.id),
            displayText: word.word.trim(),
            canonicalKey: canonical,
            activeKey: canonical,
            keyVersion: 1,
            language: "en",
            caseMode,
            kind: /\s/.test(canonical) ? "phrase" : "word",
          };
          await this.db.entries.add(entry);
        }
        const identity = exactSenseKey(word.pos, word.sense);
        let sense = await this.db.senses
          .where("[scopeId+entryId+identity]")
          .equals([this.scope.id, entry.id, identity])
          .first();
        if (sense?.deletedAt) throw new RepositoryError("conflict"); // Never silently restore archived content.
        if (sense) {
          // A reviewed re-import can fill missing art, while preserving all parent text.
          if(!sense.art&&word.art&&safeArt(word.art)&&!word.art.startsWith('media-')){const current=await this.word(sense.id);if(current){await this.prepareLearning([{id:sense.id,revision:current.revision,art:word.art}],null);sense=(await this.db.senses.get([this.scope.id,sense.id]))!;}}
          result.linked++;
        }
        else {
          const idTaken = await this.db.senses.get([this.scope.id, word.id]);
          if (idTaken) throw new RepositoryError("conflict");
          const complete =
            !!word.vi.trim() && !!word.en.trim() && !!word.example.trim();
          const approved = word.approved === true;
          const normalizeDefinition=(text:string)=>text.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
          const exactMeaning=await this.db.senses.where('[scopeId+entryId]').equals([this.scope.id,entry.id]).filter(existing=>!existing.deletedAt&&existing.pos===word.pos&&!!word.vi.trim()&&!!word.en.trim()&&normalizeDefinition(existing.meaningVi)===normalizeDefinition(word.vi)&&normalizeDefinition(existing.definitionEn)===normalizeDefinition(word.en)).first();
          sense = {
            ...base(this.scope.id, word.id),
            entryId: entry.id,
            identity,
            pos: word.pos,
            senseLabel: word.sense,
            definitionEn: word.en,
            meaningVi: word.vi,
            art: word.art,
            source: word.source,
            origin: word.origin ?? "user",
            contentStatus: complete ? "complete" : "needs_enrichment",
            learningApprovalStatus: approved ? "approved" : "pending",
            contentVersion: 1,
            approvedContentVersion: approved ? 1 : null,
            pronunciations: word.pronunciations ?? [],
            tags:exactMeaning?[...(word.tags??[]).filter(tag=>!tag.startsWith(aggregateTagPrefix)),`${aggregateTagPrefix}${aggregateWordId(exactMeaning)}`]:word.tags??[],
          };
          await this.db.senses.add(sense);
          result.added++;
          if (lexemeExists) result.addedSenses++;
          if (word.example)
            await this.db.examples.add({
              ...base(this.scope.id),
              senseId: sense.id,
              position:0,textEn: word.example,
              translationVi: word.exampleVi,
              origin: sense.origin,
              pronunciations: word.examplePronunciations ?? [],
            });
          for(const extra of word.additionalExamples??[])await this.db.examples.add({...base(this.scope.id),senseId:sense.id,position:1,textEn:extra.textEn,translationVi:extra.translationVi,origin:sense.origin,pronunciations:extra.pronunciations});
        }
        const link = await this.db.lessonItems
          .where("[scopeId+lessonId+senseId]")
          .equals([this.scope.id, lessonId, sense.id])
          .first();
        if (!link) {
          let evidenceId: string | null = null;
          if (input.sourceType !== "manual") {
            const evidence = {
              ...base(this.scope.id),
              lessonId,
              literalText: word.sourceEvidenceText ?? word.word,
              origin:
                input.sourceType === "demo"
                  ? ("demo" as const)
                  : ("source" as const),
            };
            await this.db.evidence.add(evidence);
            evidenceId = evidence.id;
          }
          await this.db.lessonItems.add({
            ...base(this.scope.id),
            lessonId,
            senseId: sense.id,
            entryId: entry.id,
            evidenceId,
          });
        }
        resolved.set(word.id,{id:sense.id,revision:`${entry.version}:${sense.version}`});
        changed.add(sense.id);
      }
      for (const item of input.learning??[]){const target=resolved.get(item.wordId)!;await saveContent(this,`lesson-content-${lessonId}-${item.key}`,null,{...item.content,senseId:target.id,targetRevision:target.revision,lessonId});}
      for(const draft of input.extensions??[]){if(draft.source.kind==='sense'){const target=resolved.get(draft.key);if(target)await saveExtensionProposal(this,'sense',target.id,draft);}else{const item=input.learning?.find(i=>`grammar:${i.key}`===draft.key);if(item)await saveExtensionProposal(this,'grammar',`lesson-content-${lessonId}-${item.key}`,draft);}}
      for(const picture of pictures){const target=resolved.get(picture.wordId);const word=target?await this.word(target.id):null;if(!word)throw new RepositoryError('invalid');if(!word.art)await saveMedia(this,{...picture.asset,senseId:word.id,word:word.word,revision:word.revision});}
      for (const id of changed) await this.reindex(id);
      await this.db.receipts.add({
        scopeId: this.scope.id,
        id: input.operationId,
        payloadHash: hash,
        result,
      });
      if (input.draftId) {
        const draft = await this.db.drafts.get([this.scope.id, input.draftId]);
        if (!draft || draft.saveOperationId !== input.operationId)
          throw new RepositoryError("conflict");
        await this.db.drafts.put({
          ...draft,
          phase: "saved",
          lastReceiptId: input.operationId,
          updatedAt: new Date().toISOString(),
          version: draft.version + 1,
        });
      }
      await this.journal("lesson", lessonId, {
        operationId: input.operationId,
        payloadHash: hash,
      });
      return result;
    });
  }
  async prepareLearning(images:{id:string;revision:string;art:string}[],target:{id:string;revision:string;contents:{key:string;content:Omit<LearningContent,"senseId"|"targetRevision">}[]}|null){
    if(images.length>50)throw new RepositoryError('invalid');
    return this.db.transaction('rw',this.db.tables,async()=>{
      for(const image of images){if(!safeArt(image.art)||image.art.startsWith('media-'))throw new RepositoryError('invalid');const word=await this.word(image.id);if(!word||word.revision!==image.revision||word.art)throw new RepositoryError('conflict');const sense=(await this.db.senses.get([this.scope.id,image.id]))!;const at=new Date().toISOString(),revision=`${word.revision.split(':')[0]}:${sense.version+1}`;await this.db.senses.put({...sense,art:image.art,version:sense.version+1,updatedAt:at});
        const table=this.db.table<import('./types').ScopedDocument>('sentences');const rows=await table.where('[scopeId+id]').between([this.scope.id,''],[this.scope.id,'\uffff']).toArray();for(const row of rows){const c=row.payload.content as LearningContent;if(!row.deletedAt&&c?.senseId===word.id&&c.targetRevision===word.revision)await table.put({...row,version:row.version+1,updatedAt:at,payload:{...row.payload,content:{...c,targetRevision:revision}}});}
        await this.reindex(image.id);await this.journal('sense',image.id,{baseVersion:sense.version,version:sense.version+1});
      }
      if(target){const word=await this.word(target.id);const changed=images.some(i=>i.id===target.id);const expected=changed?`${target.revision.split(':')[0]}:${Number(target.revision.split(':')[1])+1}`:target.revision;if(!word||word.revision!==expected)throw new RepositoryError('conflict');for(const item of target.contents){const id=`object-pattern-${word.id}-${item.key}`;if(await this.db.table('sentences').get([this.scope.id,id]))continue;await saveContent(this,id,null,{...item.content,senseId:word.id,targetRevision:word.revision});}}
    });
  }
  async editLesson(id:string,version:number,title:string,learnedOn:string){
    text(200).parse(title);if(!/^\d{4}-\d{2}-\d{2}$/.test(learnedOn)||new Date(learnedOn+'T12:00:00Z').toISOString().slice(0,10)!==learnedOn)throw new RepositoryError('invalid');
    return this.db.transaction('rw',this.db.tables,async()=>{const row=await this.db.lessons.get([this.scope.id,id]);if(!row||row.deletedAt||row.version!==version)throw new RepositoryError('conflict');await this.db.lessons.put({...row,title:title.trim(),learnedOn,version:version+1,updatedAt:new Date().toISOString()});await this.journal('lesson',id,{baseVersion:version,version:version+1});});
  }
  async editWord(
    id: string,
    revision: string,
    patch: Pick<DemoEntry, "word" | "vi" | "en">,
  ) {
    const validated = z
      .object({ word: text(200), vi: text(1000), en: text(1000) })
      .strict()
      .parse(patch);
    return this.db.transaction("rw", this.db.tables, async () => {
      const s = await this.db.senses.get([this.scope.id, id]);
      const e = s && (await this.db.entries.get([this.scope.id, s.entryId]));
      if (!s || !e || s.deletedAt || e.deletedAt)
        throw new RepositoryError("missing");
      if (`${e.version}:${s.version}` !== revision)
        throw new RepositoryError("conflict");
      const canonical = canonicalKey(validated.word, e.caseMode);
      const collision = await this.db.entries
        .where("[scopeId+language+activeKey+caseMode]")
        .equals([this.scope.id, e.language, canonical, e.caseMode])
        .first();
      if (collision && collision.id !== e.id)
        throw new RepositoryError("conflict");
      const wordChanged = e.displayText !== validated.word;
      const at = new Date().toISOString();
      if (wordChanged) {
        // A changed word invalidates its attached examples/pronunciation. Preserve
        // the approved learning snapshot until T07 can review the whole proposal.
        await this.db.senses.put({
          ...s,
          pendingEdit: {
            patch: validated,
            contentBaseVersion: s.contentVersion,
            createdAt: at,
          },
          updatedAt: at,
          version: s.version + 1,
        });
        await this.journal("senseProposal", id, {
          baseVersion: s.version,
          version: s.version + 1,
        });
        return { proposed: true, revision: `${e.version}:${s.version + 1}` };
      }
      const contentVersion = s.contentVersion + 1;
      const approved =
        s.learningApprovalStatus === "approved" &&
        s.approvedContentVersion === s.contentVersion;
      await this.db.senses.put({
        ...s,
        pendingEdit: null,
        tags:s.meaningVi===validated.vi&&s.definitionEn===validated.en?s.tags:s.tags.filter(tag=>!tag.startsWith(aggregateTagPrefix)),
        meaningVi: validated.vi,
        definitionEn: validated.en,
        origin: "user",
        updatedAt: at,
        version: s.version + 1,
        contentVersion,
        learningApprovalStatus: approved ? "approved" : "pending",
        approvedContentVersion: approved ? contentVersion : null,
        pronunciations:s.pronunciations.filter(p=>p.text===e.displayText).map(p=>({...p,contentVersion,approvedContentVersion:approved?contentVersion:null})),
      });
      await this.reindex(id);
      await this.journal("sense", id, {
        baseVersion: s.version,
        version: s.version + 1,
      });
      return { proposed: false, revision: `${e.version}:${s.version + 1}` };
    });
  }

  async reviewWord(id:string,revision:string,input:WordInput){
    const word=inputSchema.parse(withoutWordMemberships(input));
    if(!word.vi.trim()||!word.en.trim()||!!word.example.trim()!==!!word.exampleVi.trim()||word.approved!==true)throw new RepositoryError("invalid");
    return this.db.transaction("rw",this.db.tables,async()=>{
      const sense=await this.db.senses.get([this.scope.id,id]);const oldEntry=sense&&await this.db.entries.get([this.scope.id,sense.entryId]);
      if(!sense||!oldEntry||sense.deletedAt||`${oldEntry.version}:${sense.version}`!==revision)throw new RepositoryError("conflict");
      const caseMode=word.caseMode??oldEntry.caseMode,canonical=canonicalKey(word.word,caseMode);
      let entry=await this.db.entries.where("[scopeId+language+activeKey+caseMode]").equals([this.scope.id,"en",canonical,caseMode]).first();
      if(!entry){entry={...base(this.scope.id),displayText:word.word,language:"en",canonicalKey:canonical,activeKey:canonical,keyVersion:1,caseMode,kind:/\s/.test(canonical)?"phrase":"word"};await this.db.entries.add(entry);}
      const identity=exactSenseKey(word.pos,word.sense),collision=await this.db.senses.where("[scopeId+entryId+identity]").equals([this.scope.id,entry.id,identity]).first();
      if(collision&&collision.id!==id)throw new RepositoryError("conflict");
      const at=new Date().toISOString(),contentVersion=sense.contentVersion+1;
      await this.db.senses.put({...sense,tags:sense.entryId===entry.id&&sense.pos===word.pos&&sense.meaningVi===word.vi&&sense.definitionEn===word.en?sense.tags:sense.tags.filter(tag=>!tag.startsWith(aggregateTagPrefix)),entryId:entry.id,identity,pos:word.pos,senseLabel:word.sense,meaningVi:word.vi,definitionEn:word.en,art:word.art,origin:"user",source:word.source,pendingEdit:null,contentStatus:"complete",contentVersion,approvedContentVersion:contentVersion,learningApprovalStatus:"approved",version:sense.version+1,updatedAt:at,
        pronunciations:(word.pronunciations??[]).filter(p=>p.text===word.word).map(p=>({...p,contentVersion,approvedContentVersion:contentVersion}))});
      if(word.art?.startsWith('media-')){const media=this.db.table<import('./types').ScopedDocument>('mediaAssets'),row=await media.get([this.scope.id,word.art]);const asset=row?.payload.asset as import('@/lib/media/contracts').MediaAsset|undefined;if(!row||row.deletedAt||asset?.senseId!==id||!asset.approved||asset.status!=='ready')throw new RepositoryError('invalid');await media.put({...row,version:row.version+1,updatedAt:at,payload:{asset:{...asset,word:word.word,revision:`${entry.version}:${sense.version+1}`}}});}
      const examples=await this.db.examples.where("[scopeId+senseId]").equals([this.scope.id,id]).toArray();
      for(const example of examples)await this.db.examples.update([this.scope.id,example.id],{deletedAt:at,version:example.version+1});
      await this.db.examples.add({...base(this.scope.id),senseId:id,position:0,textEn:word.example,translationVi:word.exampleVi,origin:"user",pronunciations:(word.examplePronunciations??[]).filter(p=>p.text===word.example).map(p=>({...p,contentVersion,approvedContentVersion:contentVersion}))});
      for(const extra of word.additionalExamples??[])await this.db.examples.add({...base(this.scope.id),senseId:id,position:1,textEn:extra.textEn,translationVi:extra.translationVi,origin:'user',pronunciations:extra.pronunciations.map(p=>({...p,contentVersion,approvedContentVersion:contentVersion}))});
      const links=await this.db.lessonItems.where("[scopeId+senseId]").equals([this.scope.id,id]).toArray();for(const link of links)await this.db.lessonItems.update([this.scope.id,link.id],{entryId:entry.id});
      await this.reindex(id);await this.journal("sense",id,{baseVersion:sense.version,version:sense.version+1});return this.word(id);
    });
  }

  async setDraft(candidates: Candidate[]) {
    candidates = z.array(candidateSchema).max(100).parse(candidates);
    if (this.scope.kind !== "demo" || candidates.length > 100)
      throw new RepositoryError("invalid");
    return this.db.transaction("rw", this.db.drafts, async () => {
      const old = await this.db.drafts.get([this.scope.id, "demo"]);
      if (!old) throw new RepositoryError("missing");
      const changed = stableJson(old.candidates) !== stableJson(candidates);
      if (!changed) return;
      await this.db.drafts.put({
        ...old,
        candidates,
        phase: "review",
        saveOperationId: crypto.randomUUID(),
        updatedAt: new Date().toISOString(),
        version: old.version + 1,
      });
    });
  }
  async draft() {
    return this.db.drafts.get([this.scope.id, "demo"]);
  }
  async lastResult() {
    const draft = await this.draft();
    return draft?.lastReceiptId
      ? ((await this.db.receipts.get([this.scope.id, draft.lastReceiptId]))
          ?.result ?? null)
      : null;
  }
  async saveDemo() {
    const draft = await this.draft();
    const selected = draft?.candidates.filter((c) => c.selected) ?? [];
    if (!draft || !selected.length || selected.some((c) => !validCandidate(c)))
      throw new RepositoryError("invalid");
    return this.saveLesson({
      operationId: draft.saveOperationId,
      draftId: "demo",
      lessonId: "school-objects",
      title: "School objects",
      learnedOn: draft.createdAt.slice(0, 10),
      sourceType: "demo",
      items: selected.map((c) => ({
        id: c.id,
        word: c.text.trim(),
        vi: c.vi.trim(),
        en: c.en,
        example: c.example,
        exampleVi: c.exampleVi,
        art: c.art,
        lesson: "school-objects",
        pos: c.pos,
        sense: c.sense,
        source: c.source,
        ready: c.ready,
        sourceEvidenceText:
          demoCandidates.find((original) => original.id === c.id)?.text ??
          c.text,
        origin: "demo",
        approved: true,
      })),
    });
  }
  async saveNote(input: {
    id: string;
    targetType: Note["targetType"];
    targetId: string;
    text: string;
    expectedVersion: number | null;
    mnemonicData?: Note["mnemonicData"];
  }) {
    const parsed = z
      .object({
        id: text(100),
        targetType: z.enum(["sense", "lesson"]),
        targetId: text(100),
        text: z.string().max(10000),
        expectedVersion: z.number().int().positive().nullable(),
        mnemonicData: z.object({template:z.enum(["word-association","sentence-chunks","grammar-transform"])}).strict().nullable().optional(),
      })
      .strict()
      .parse(input);
    return this.db.transaction("rw", this.db.tables, async () => {
      const target =
        parsed.targetType === "sense"
          ? await this.db.senses.get([this.scope.id, parsed.targetId])
          : await this.db.lessons.get([this.scope.id, parsed.targetId]);
      if (!target || target.deletedAt) throw new RepositoryError("missing");
      const old = await this.db.notes.get([this.scope.id, parsed.id]);
      if (
        (old?.version ?? null) !== parsed.expectedVersion ||
        (old &&
          (old.targetId !== parsed.targetId ||
            old.targetType !== parsed.targetType))
      )
        throw new RepositoryError("conflict");
      const note: Note = {
        ...(old ?? base(this.scope.id, parsed.id)),
        targetId: parsed.targetId,
        targetType: parsed.targetType,
        text: parsed.text,
        mnemonicData: parsed.mnemonicData === undefined ? old?.mnemonicData ?? null : parsed.mnemonicData,
        origin: "user",
        updatedAt: new Date().toISOString(),
        version: old ? old.version + 1 : 1,
      };
      await this.db.notes.put(note);
      await this.journal("note", note.id, { version: note.version });
      return note;
    });
  }
  async appendReviewEvent(input: Omit<ReviewEvent, "scopeId">) {
    const data = z
      .object({
        id: text(100),
        senseId: text(100),
        sessionId: text(100),
        rating: z.enum(["Again", "Hard", "Good", "Easy"]),
        eventTime: z.iso.datetime(),
        hints: z.boolean(),
      })
      .strict()
      .parse(input);
    return this.db.transaction("rw", this.db.tables, async () => {
      const sense = await this.db.senses.get([this.scope.id, data.senseId]);
      if (!sense || sense.deletedAt) throw new RepositoryError("missing");
      const old = await this.db.reviewEvents.get([this.scope.id, data.id]);
      const event: ReviewEvent = { ...data, scopeId: this.scope.id };
      if (old && stableJson(old) !== stableJson(event))
        throw new RepositoryError("conflict");
      if (!old) {
        await this.db.reviewEvents.add(event);
        await this.journal("reviewEvent", event.id, { ...data });
      }
      return event;
    });
  }
}
export async function openLocalRepository(db: LibraryDatabase, demo: boolean) {
  await db.open();
  const kind = demo ? "demo" : "guest";
  const scope = await db.transaction(
    "rw",
    db.metadata,
    db.libraries,
    async () => {
      const key = `active-${kind}`;
      const record = await db.metadata.get(key);
      if (record) {
        const library = await db.libraries.get(record.value);
        if (!library || library.scope.kind !== kind)
          throw new RepositoryError("scope");
        return library.scope;
      }
      const id = crypto.randomUUID();
      const scope: Scope = { kind, id: `${kind}:${id}` };
      await db.libraries.add({ id, scopeId: scope.id, scope, seeded: false });
      await db.metadata.add({ key, value: id });
      return scope;
    },
  );
  const repo = new LocalRepository(db, scope);
  if (demo) {
    // Seed once under a distinct demo scope; concurrent tabs recheck inside the transaction.
    const library = await db.libraries
      .where("scopeId")
      .equals(scope.id)
      .first();
    if (!library) throw new RepositoryError("scope");
    if (!library.seeded) {
      // Hashing outside transaction; saveLesson creates the seed receipt atomically.
      for (const lesson of ["food", "school"]) {
        const entries = demoEntries.filter((e) => e.lesson === lesson);
        if (entries.length)
          await repo.saveLesson({
            operationId: `seed-${lesson}-v1`,
            lessonId: lesson,
            title:
              lesson === "food"
                ? "Fruit & food / Trái cây & đồ ăn"
                : "Your world / Thế giới quanh con",
            learnedOn: "2026-10-09",
            sourceType: "demo",
            items: entries.map((e) => ({
              ...e,
              additionalExamples:catalog.find(item=>item.id===`catalog-${e.id}`)?.additionalExamples,
              origin: "demo",
              approved: true,
            })),
          });
      }
      await db.transaction("rw", db.libraries, db.drafts, async () => {
        const current = await db.libraries.get(library.id);
        if (!current?.seeded) {
          await db.drafts.add({
            ...base(scope.id, "demo"),
            candidates: demoCandidates,
            saveOperationId: crypto.randomUUID(),
            phase: "review",
            lastReceiptId: null,
          });
          await db.libraries.put({ ...library, seeded: true });
        }
      });
    }
  }
  if (demo) await db.transaction("rw",db.senses,db.examples,async()=>{
    const senses=await db.senses.where("[scopeId+entryId]").between([scope.id,Dexie.minKey],[scope.id,Dexie.maxKey]).toArray();
    for(const sense of senses){const item=catalog.find(item=>item.id===`catalog-${sense.id}`);
      if(!item || sense.origin!=="demo")continue;
      if(!sense.pronunciations?.length)await db.senses.update([scope.id,sense.id],{pronunciations:(item.pronunciations??[]).map(p=>({...p,contentVersion:sense.contentVersion,approvedContentVersion:sense.approvedContentVersion}))});
      else {const source=item.pronunciations?.find(p=>p.verified&&p.ipa&&p.sourceUrl);if(source){const upgraded=sense.pronunciations.map(p=>p.text===source.text&&p.ipa===null&&p.sourceUrl===null?{...p,ipa:source.ipa,sourceUrl:source.sourceUrl,verified:true,origin:source.origin,accent:source.accent}:p);if(upgraded.some((p,i)=>p!==sense.pronunciations[i]))await db.senses.update([scope.id,sense.id],{pronunciations:upgraded});}}
      const examples=await db.examples.where("[scopeId+senseId]").equals([scope.id,sense.id]).toArray();
      // Backfill only untouched demo content; never replace an edited example.
      if(sense.contentVersion===1&&examples.filter(e=>!e.deletedAt).length===1&&examples.some(e=>!e.deletedAt&&e.textEn===item.example))for(const extra of item.additionalExamples??[]){const id=`demo-extra-${sense.id}`;if(!await db.examples.get([scope.id,id]))await db.examples.add({...base(scope.id,id),senseId:sense.id,position:1,textEn:extra.textEn,translationVi:extra.translationVi,origin:"demo",pronunciations:extra.pronunciations});}
      for(const example of examples)if(!example.pronunciations?.length && example.textEn===item.example)await db.examples.update([scope.id,example.id],{pronunciations:item.examplePronunciations??[]});
    }
  });
  await db.transaction("rw",db.entries,db.senses,async()=>{
    const senses=await db.senses.where("[scopeId+entryId]").between([scope.id,Dexie.minKey],[scope.id,Dexie.maxKey]).toArray();
    for(const sense of senses){const entry=await db.entries.get([scope.id,sense.entryId]);if(!entry||entry.deletedAt||sense.deletedAt)continue;const known=catalog.find(word=>word.word===entry.displayText&&word.pronunciations?.some(p=>p.verified&&p.ipa));const source=known?.pronunciations?.find(p=>p.verified&&p.ipa);if(!source)continue;const current=sense.pronunciations??[];const next=current.length?current.map(p=>p.text===entry.displayText&&p.ipa===null&&p.sourceUrl===null?{...p,ipa:source.ipa,accent:source.accent,sourceUrl:source.sourceUrl,verified:true,origin:source.origin}:p):[{...source,contentVersion:sense.contentVersion,approvedContentVersion:sense.approvedContentVersion,readingHintVi:null}];if(!current.length||next.some((p,i)=>p!==current[i]))await db.senses.update([scope.id,sense.id],{pronunciations:next});}
  });
  return repo;
}
