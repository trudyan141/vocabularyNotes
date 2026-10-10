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
import type {
  Base,
  LibraryWord,
  Note,
  ReviewEvent,
  SaveResult,
  Scope,
  SearchResult,
  WordInput,
} from "./types";
const text = (max: number) => z.string().trim().min(1).max(max);
const pronunciationSchema = z.object({
  text: text(2000), contentVersion: z.number().int().positive(),
  accent: z.enum(["UK", "US", "other"]), ipa: z.string().max(300).nullable(),
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
    public code: "conflict" | "invalid" | "missing" | "scope" | "not-ready",
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
  constructor(
    public readonly db: LibraryDatabase,
    public readonly scope: Scope,
  ) {
    scopeCheck(scope);
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
      this.db.entries,
      this.db.senses,
      this.db.examples,
      this.db.lessonItems,
      this.db.table("mediaAssets"),
      () => this.readWords(ids),
    );
  }
  private async readWords(ids: string[]): Promise<LibraryWord[]> {
    if (!ids.length) return [];
    const senses = await this.db.senses.bulkGet(
      ids.map((id) => [this.scope.id, id]),
    );
    const [lexemes, examples, links] = await Promise.all([
      this.db.entries.bulkGet(
        [...new Set(senses.flatMap((s) => (s ? [s.entryId] : [])))].map(
          (id) => [this.scope.id, id],
        ),
      ),
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
  async search(
    query: string,
    options: {
      lesson?: string | null;
      missingArt?: boolean;
      offset?: number;
      limit?: number;
      approvedOnly?: boolean;
    } = {},
  ): Promise<SearchResult> {
    return this.db.transaction(
      "r",
      [this.db.entries,this.db.senses,this.db.examples,this.db.lessonItems,this.db.searchIndex,this.db.table("mediaAssets")],
      () => this.readSearch(query, options),
    );
  }
  private async readSearch(
    query: string,
    options: {
      lesson?: string | null;
      missingArt?: boolean;
      offset?: number;
      limit?: number;
      approvedOnly?: boolean;
    } = {},
  ): Promise<SearchResult> {
    const needle = searchTerms(query);
    const rows = await this.db.searchIndex
      .where("[scopeId+ordinal]")
      .between([this.scope.id, Dexie.minKey], [this.scope.id, Dexie.maxKey])
      .toArray();
    const source = rows.filter((r) => !options.approvedOnly || r.approval);
    const matches = source.filter(
      (r) =>
        (!needle || r.terms.includes(needle)) &&
        (!options.lesson || r.lessonIds.includes(options.lesson)) &&
        (!options.missingArt || !r.art),
    );
    const limit = Math.max(1, Math.min(options.limit ?? 50, 100));
    const offset = Math.max(0, options.offset ?? 0);
    return {
      words: await this.words(
        matches.slice(offset, offset + limit).map((r) => r.id),
      ),
      total: matches.length,
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
    sourceType: "demo" | "manual" | "image";
    items: WordInput[];
    draftId?: string;
    lessonId?: string;
  }) {
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
    const hash = await contentHash({ ...input, items }); // WebCrypto must finish before opening an IDB transaction.
    return this.db.transaction("rw", this.db.tables, async () => {
      const key: [string, string] = [this.scope.id, input.operationId];
      const receipt = await this.db.receipts.get(key);
      if (receipt) {
        if (receipt.payloadHash !== hash) throw new RepositoryError("conflict");
        return receipt.result;
      }
      const lessonId = input.lessonId ?? crypto.randomUUID();
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
        if (sense) result.linked++;
        else {
          const idTaken = await this.db.senses.get([this.scope.id, word.id]);
          if (idTaken) throw new RepositoryError("conflict");
          const complete =
            !!word.vi.trim() && !!word.en.trim() && !!word.example.trim();
          const approved = word.approved === true;
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
            tags: word.tags ?? [],
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
        changed.add(sense.id);
      }
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
    const word=inputSchema.parse(input);
    if(!word.vi.trim()||!word.en.trim()||!word.example.trim()||!word.exampleVi.trim()||word.approved!==true)throw new RepositoryError("invalid");
    return this.db.transaction("rw",this.db.tables,async()=>{
      const sense=await this.db.senses.get([this.scope.id,id]);const oldEntry=sense&&await this.db.entries.get([this.scope.id,sense.entryId]);
      if(!sense||!oldEntry||sense.deletedAt||`${oldEntry.version}:${sense.version}`!==revision)throw new RepositoryError("conflict");
      const caseMode=word.caseMode??oldEntry.caseMode,canonical=canonicalKey(word.word,caseMode);
      let entry=await this.db.entries.where("[scopeId+language+activeKey+caseMode]").equals([this.scope.id,"en",canonical,caseMode]).first();
      if(!entry){entry={...base(this.scope.id),displayText:word.word,language:"en",canonicalKey:canonical,activeKey:canonical,keyVersion:1,caseMode,kind:/\s/.test(canonical)?"phrase":"word"};await this.db.entries.add(entry);}
      const identity=exactSenseKey(word.pos,word.sense),collision=await this.db.senses.where("[scopeId+entryId+identity]").equals([this.scope.id,entry.id,identity]).first();
      if(collision&&collision.id!==id)throw new RepositoryError("conflict");
      const at=new Date().toISOString(),contentVersion=sense.contentVersion+1;
      await this.db.senses.put({...sense,entryId:entry.id,identity,pos:word.pos,senseLabel:word.sense,meaningVi:word.vi,definitionEn:word.en,art:word.art,origin:"user",source:word.source,pendingEdit:null,contentStatus:"complete",contentVersion,approvedContentVersion:contentVersion,learningApprovalStatus:"approved",version:sense.version+1,updatedAt:at,
        pronunciations:(word.pronunciations??[]).filter(p=>p.text===word.word).map(p=>({...p,contentVersion,approvedContentVersion:contentVersion}))});
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
