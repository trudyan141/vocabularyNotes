/** Remove only the retired recognition pack, never lessons, other caches or settings. */
export async function removeRetiredSpeakingPacks(storage:CacheStorage){
 for(const key of await storage.keys())if(key.startsWith('wfk-speaking-model-'))await storage.delete(key);
}
