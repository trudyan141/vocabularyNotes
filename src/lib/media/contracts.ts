import {z} from 'zod';
const hosted=(host:string)=>z.url().refine(value=>{const u=new URL(value);return u.protocol==='https:'&&u.hostname===host&&!u.port&&!u.username&&!u.password;});
export const mediaCandidate=z.object({id:z.string().regex(/^\d+:[a-z0-9]{20,64}$/),title:z.string().startsWith('File:').max(300),sourceUrl:hosted('commons.wikimedia.org'),imageUrl:z.union([hosted('upload.wikimedia.org'),hosted('thumb.wikimedia.org')]),creator:z.string().min(1).max(1000),license:z.enum(['CC0','Public domain','CC BY 4.0','CC BY 3.0']),licenseUrl:hosted('creativecommons.org'),credit:z.string().min(1).max(2000)}).strict();
export type MediaCandidate=z.infer<typeof mediaCandidate>;
export const mediaAsset=z.object({candidate:mediaCandidate,senseId:z.string().min(1).max(100),word:z.string().min(1).max(200),revision:z.string().max(100),base64:z.string().min(1).max(670000).regex(/^[A-Za-z0-9+/]+={0,2}$/),sha256:z.string().regex(/^[a-f0-9]{64}$/),checkedAt:z.iso.datetime(),receipt:z.string().min(1).max(12000),status:z.enum(['pending','ready']),approved:z.boolean()}).strict();
export type MediaAsset=z.infer<typeof mediaAsset>;
