import { Dexie, type Table, type Transaction } from "dexie";
import { searchTerms } from "@/domain/identity";
import type { CaptureDraft, LocalImage } from "./capture";
import type {
  Base,
  Draft,
  Evidence,
  Example,
  Lexeme,
  Library,
  Metadata,
  Note,
  ReviewEvent,
  SaveReceipt,
  ScopedDocument,
  SearchRow,
  Sense,
  Lesson,
  LessonItem,
} from "./types";
export const databaseName = "words-for-kids.local";
export const schemaV1 = {
  metadata: "key",
  libraries: "id, &scopeId",
  entries: "[scopeId+id], &[scopeId+language+activeKey+caseMode]",
  senses: "[scopeId+id], [scopeId+entryId], &[scopeId+entryId+identity]",
  examples: "[scopeId+id], [scopeId+senseId]",
  lessons: "[scopeId+id], [scopeId+learnedOn]",
  lessonItems:
    "[scopeId+id], [scopeId+senseId], [scopeId+lessonId], &[scopeId+lessonId+senseId]",
  evidence: "[scopeId+id], [scopeId+lessonId]",
  notes: "[scopeId+id], [scopeId+targetType+targetId]",
  reviewEvents: "[scopeId+id], [scopeId+senseId], [scopeId+sessionId]",
  drafts: "[scopeId+id]",
  receipts: "[scopeId+id]",
  ...Object.fromEntries(
    [
      "surfaceForms",
      "sentences",
      "patterns",
      "grammarItems",
      "sourceAssets",
      "mediaAssets",
      "decks",
      "deckItems",
      "reviewStates",
      "practiceSessions",
      "gameAttempts",
      "outbox",
      "localMedia",
      "transferCheckpoints",
    ].map((name) => [name, "[scopeId+id]"]),
  ),
};
export const schemaV2 = {
  ...schemaV1,
  searchIndex: "[scopeId+id], [scopeId+ordinal]",
};
export async function rebuildSearch(tx: Transaction) {
  const [entries, senses, examples, links, lessons] = await Promise.all([
    tx.table<Lexeme>("entries").toArray(),
    tx.table<Sense>("senses").toArray(),
    tx.table<Example>("examples").toArray(),
    tx.table<LessonItem>("lessonItems").toArray(),
    tx.table<Lesson>("lessons").toArray(),
  ]);
  const key = (row: Pick<Base, "scopeId" | "id">) =>
    JSON.stringify([row.scopeId, row.id]);
  const lexemes = new Map(entries.map((e) => [key(e), e]));
  const lessonMap = new Map(lessons.filter(l=>!l.deletedAt).map((l) => [key(l), l]));
  const exampleMap = new Map<string, Example[]>();
  for (const e of examples.filter(e=>!e.deletedAt)) {
    const id = key({ scopeId: e.scopeId, id: e.senseId });
    exampleMap.set(id, [...(exampleMap.get(id) ?? []), e]);
  }
  const linkMap = new Map<string, LessonItem[]>();
  for (const l of links.filter(l=>!l.deletedAt&&lessonMap.has(key({scopeId:l.scopeId,id:l.lessonId})))) {
    const id = key({ scopeId: l.scopeId, id: l.senseId });
    linkMap.set(id, [...(linkMap.get(id) ?? []), l]);
  }
  const rows: SearchRow[] = [];
  for (const s of senses) {
    const e = lexemes.get(key({ scopeId: s.scopeId, id: s.entryId }));
    if (!e || s.deletedAt || e.deletedAt) continue;
    const senseLinks = linkMap.get(key(s)) ?? [];
    const terms = searchTerms(
      [
        e.displayText,
        s.meaningVi,
        s.definitionEn,
        s.pos,
        s.senseLabel,
        ...(s.tags ?? []),
        ...(exampleMap.get(key(s)) ?? []).map(
          (x) => `${x.textEn} ${x.translationVi}`,
        ),
        ...senseLinks.map(
          (l) =>
            lessonMap.get(key({ scopeId: s.scopeId, id: l.lessonId }))?.title ??
            "",
        ),
      ].join(" "),
    );
    rows.push({
      scopeId: s.scopeId,
      id: s.id,
      terms,
      lessonIds: senseLinks.map((l) => l.lessonId),
      art: s.art,
      ordinal: s.createdAt + s.id,
      approval:
        s.learningApprovalStatus === "approved" &&
        s.approvedContentVersion === s.contentVersion,
    });
  }
  await tx.table("searchIndex").clear();
  await tx.table("searchIndex").bulkPut(rows);
}
export class LibraryDatabase extends Dexie {
  metadata!: Table<Metadata, string>;
  libraries!: Table<Library, string>;
  entries!: Table<Lexeme, [string, string]>;
  senses!: Table<Sense, [string, string]>;
  examples!: Table<Example, [string, string]>;
  lessons!: Table<Lesson, [string, string]>;
  lessonItems!: Table<LessonItem, [string, string]>;
  evidence!: Table<Evidence, [string, string]>;
  notes!: Table<Note, [string, string]>;
  reviewEvents!: Table<ReviewEvent, [string, string]>;
  drafts!: Table<Draft, [string, string]>;
  receipts!: Table<SaveReceipt, [string, string]>;
  searchIndex!: Table<SearchRow, [string, string]>;
  outbox!: Table<ScopedDocument, [string, string]>;
  captureDrafts!: Table<CaptureDraft, [string, string]>;
  localMedia!: Table<LocalImage, [string, string]>;
  constructor(name = databaseName) {
    super(name);
    this.version(1).stores(schemaV1);
    this.version(2)
      .stores(schemaV2)
      .upgrade(async (tx) => {
        // Additive migration: preserve content, IDs, notes, events and user fields.
        await tx
          .table("senses")
          .toCollection()
          .modify((s: Sense) => {
            s.tags ??= [];
            s.pronunciations ??= [];
          });
        await tx
          .table("examples")
          .toCollection()
          .modify((e: Example) => {
            e.pronunciations ??= [];
          });
        await rebuildSearch(tx);
      });
    // Add a typed capture store without touching existing review drafts or content.
    this.version(3).stores({
      ...schemaV2,
      captureDrafts: "[scopeId+id], [scopeId+updatedAt]",
    });
    this.version(4).stores({
      ...schemaV2, captureDrafts: "[scopeId+id], [scopeId+updatedAt]",
      learningDrafts: "[scopeId+id]",
    });
  }
}
