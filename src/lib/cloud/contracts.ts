import {z} from 'zod';
import {archiveRecordsSchema} from '@/data/local/archive';
export const cloudTables=['lessons','entries','senses','evidence','examples','lessonItems','notes','decks','sentences','practiceCycles','practiceSessions','reviewEvents','gameAttempts','mediaAssets','learningExtensions','shadowingContent'] as const;
export type CloudTable=typeof cloudTables[number];
export type PullTable=CloudTable|'reviewStates';
export const cloudEntities={lessons:'lessons',entries:'vocabulary_entries',senses:'entry_senses',evidence:'source_evidence',examples:'examples',lessonItems:'lesson_vocabulary',notes:'notes',decks:'decks',sentences:'learning_content',practiceCycles:'practice_cycles',practiceSessions:'practice_sessions',reviewEvents:'review_events',gameAttempts:'game_attempts',mediaAssets:'media_assets',reviewStates:'review_states',learningExtensions:'learning_extensions',shadowingContent:'shadowing_content'} as const;
export const syncRequestSchema=z.object({libraryId:z.uuid(),operationId:z.uuid(),items:z.array(z.object({entity:z.enum(cloudTables),baseVersion:z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),row:z.unknown()}).strict()).min(1).max(100)}).strict();
export type SyncRequest=z.infer<typeof syncRequestSchema>;
export function parseCloudRow(entity:PullTable,value:unknown):Record<string,unknown>{return (entity==='shadowingContent'?archiveRecordsSchema.shape.shadowingContent.unwrap():entity==='mediaAssets'?archiveRecordsSchema.shape.mediaAssets.unwrap():entity==='practiceCycles'?archiveRecordsSchema.shape.practiceCycles.unwrap():entity==='learningExtensions'?archiveRecordsSchema.shape.learningExtensions.unwrap():archiveRecordsSchema.shape[entity]).element.parse(value) as Record<string,unknown>;}
export const pullSchema=z.object({libraryId:z.uuid(),cursor:z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),more:z.boolean(),changes:z.array(z.object({sequence:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),entity:z.enum([...cloudTables,'reviewStates']),id:z.string().min(1).max(200),version:z.number().int().positive(),row:z.unknown()}).strict()).max(100)}).strict();
export type Pull=z.infer<typeof pullSchema>;
