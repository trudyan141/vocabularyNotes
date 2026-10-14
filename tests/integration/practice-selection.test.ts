import 'fake-indexeddb/auto';
import {afterEach,it,expect,vi} from 'vitest';
import Dexie from 'dexie';
import {LibraryDatabase} from '@/data/local/database';
import {LocalRepository} from '@/data/local/repository';
import {readPracticeSelection,savePracticeSelection} from '@/data/local/practice-selection';
const databases:LibraryDatabase[]=[];
function library(){const db=new LibraryDatabase(`selection-${crypto.randomUUID()}`);databases.push(db);return db;}
function guest(db:LibraryDatabase,id:string){return new LocalRepository(db,{kind:'guest',id});}
afterEach(async()=>{vi.restoreAllMocks();for(const db of databases.splice(0)){db.close();await Dexie.delete(db.name);}});
it('persists the selection across repository instances and isolates library scopes',async()=>{
 const db=library(),a=guest(db,'guest:a'),b=guest(db,'guest:b');
 const filter={lesson:'l',deck:'g',set:'s',due:true,weak:true,direction:'vi-en' as const};
 await savePracticeSelection(a,filter);expect(await readPracticeSelection(guest(db,'guest:a'))).toEqual(filter);expect(await readPracticeSelection(b)).toEqual({});
 await savePracticeSelection(b,{word:'w'});await savePracticeSelection(a,{});
 expect(await readPracticeSelection(a)).toEqual({});expect(await readPracticeSelection(b)).toEqual({word:'w'});
});
it('rejects invalid selections without overwriting the saved scope and tolerates corrupt metadata',async()=>{
 const db=library(),r=guest(db,'guest:a');await savePracticeSelection(r,{lesson:'l'});
 await expect(savePracticeSelection(r,{set:'orphan'})).rejects.toThrow();expect(await readPracticeSelection(r)).toEqual({lesson:'l'});
 const row=(await db.metadata.toArray())[0];await db.metadata.put({...row,value:'{broken'});expect(await readPracticeSelection(r)).toEqual({});
 await db.metadata.put({...row,value:JSON.stringify({session:'private-round'})});expect(await readPracticeSelection(r)).toEqual({});
});
it('reports storage failures and preserves the selection when clearing fails',async()=>{
 const db=library(),r=guest(db,'guest:a');await savePracticeSelection(r,{deck:'g'});
 const failure=vi.spyOn(db.metadata,'put').mockRejectedValueOnce(new Error('quota'));
 await expect(savePracticeSelection(r,{})).rejects.toThrow('quota');failure.mockRestore();expect(await readPracticeSelection(r)).toEqual({deck:'g'});
 vi.spyOn(db.metadata,'get').mockRejectedValueOnce(new Error('unavailable'));await expect(readPracticeSelection(r)).rejects.toThrow('unavailable');
});
