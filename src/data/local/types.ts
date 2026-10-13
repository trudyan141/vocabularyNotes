import type { CaseMode } from "@/domain/identity";
import type { Candidate, DemoEntry } from "@/lib/demo/model";
export type Scope =
  | { id: string; kind: "guest" | "demo" }
  | { id: string; kind: "account"; ownerId: string; libraryId: string };
export type Base = {
  scopeId: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  deletedAt: string | null;
};
export type Pronunciation = {
  text: string;
  contentVersion: number;
  accent: "UK" | "US" | "other";
  ipa: string | null;
  sourceUrl: string | null;
  verified: boolean;
  readingHintVi: string | null;
  origin: "source" | "user" | "ai_generated";
  approvedContentVersion: number | null;
};
export type Lexeme = Base & {
  displayText: string;
  language: "en";
  canonicalKey: string;
  keyVersion: 1;
  caseMode: CaseMode;
  activeKey?: string;
  kind: "word" | "phrase";
};
export type PendingWordEdit = {
  patch: Pick<DemoEntry, "word" | "vi" | "en">;
  contentBaseVersion: number;
  createdAt: string;
};
export type EditResult = { proposed: boolean; revision: string };
export type Sense = Base & {
  pendingEdit?: PendingWordEdit | null;
  entryId: string;
  identity: string;
  pos: string;
  senseLabel: string;
  definitionEn: string;
  meaningVi: string;
  art: string | null;
  source: string;
  origin: "demo" | "user" | "source" | "ai_generated";
  contentStatus: "complete" | "needs_enrichment";
  learningApprovalStatus: "pending" | "approved" | "rejected";
  contentVersion: number;
  approvedContentVersion: number | null;
  pronunciations: Pronunciation[];
  tags: string[];
};
export type Example = Base & {
  position?:number;
  senseId: string;
  textEn: string;
  translationVi: string;
  origin: Sense["origin"];
  pronunciations: Pronunciation[];
};
export type Lesson = Base & {
  title: string;
  learnedOn: string;
  sourceType: "demo" | "manual" | "image";
  sourceDigest: string | null;
};
export type LessonItem = Base & {
  lessonId: string;
  senseId: string;
  entryId: string;
  evidenceId: string | null;
};
export type Evidence = Base & {
  lessonId: string;
  literalText: string;
  origin: "demo" | "source";
};
export type SearchRow = {
  scopeId: string;
  id: string;
  terms: string;
  lessonIds: string[];
  art: string | null;
  ordinal: string;
  approval: boolean;
};
export type Note = Base & {
  mnemonicData?: { template: "word-association" | "sentence-chunks" | "grammar-transform" } | null;
  targetType: "sense" | "lesson";
  targetId: string;
  text: string;
  origin: "user";
};
export type ReviewEvent = {
  scopeId: string;
  id: string;
  senseId: string;
  sessionId: string;
  rating: "Again" | "Hard" | "Good" | "Easy";
  eventTime: string;
  hints: boolean;
};
export type Draft = Base & {
  candidates: Candidate[];
  saveOperationId: string;
  phase: "review" | "saved";
  lastReceiptId: string | null;
};
export type SaveResult = {
  added: number;
  linked: number;
  addedSenses: number;
  lessonId: string;
  operationId: string;
};
export type SaveReceipt = {
  scopeId: string;
  id: string;
  payloadHash: string;
  result: SaveResult;
};
export type Library = {
  id: string;
  scopeId: string;
  scope: Scope;
  seeded: boolean;
};
export type Metadata = { key: string; value: string };
// Reserved stores for later tasks; no cloud/SRS/media integration is implied.
export type ScopedDocument = Base & { payload: Record<string, unknown> };
export type WordInput = DemoEntry & {
  additionalExamples?:{textEn:string;translationVi:string;pronunciations:Pronunciation[]}[];
  pronunciations?: Pronunciation[];
  examplePronunciations?: Pronunciation[];
  caseMode?: CaseMode;
  origin?: Sense["origin"];
  approved?: boolean;
  sourceEvidenceText?: string;
  tags?: string[];
};
export type LibraryWord = DemoEntry & {
  relatedSenses?: LibraryWord[];
  groupMemberships?: {id:string;name:string}[];
  lessonMemberships?: {id:string;name:string}[];
  pronunciations: Pronunciation[];
  examplePronunciations: Pronunciation[];
  pendingEdit?: PendingWordEdit | null;
  origin: Sense["origin"];
  revision: string;
  caseMode: CaseMode;
  approved: boolean;
  tags: string[];
};
export type SearchResult = {
  words: LibraryWord[];
  total: number;
  totalLibrary: number;
};
