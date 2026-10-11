import 'fake-indexeddb/auto';
import {test,expect,type BrowserContext,type WebSocketRoute} from '@playwright/test';
import {LibraryDatabase} from '../../src/data/local/database';
import {LocalRepository} from '../../src/data/local/repository';
import {catalog} from '../../src/lib/learning/catalog';
import {cloudTables,cloudEntities,type Pull,type SyncRequest} from '../../src/lib/cloud/contracts';
const owner='60000000-0000-4000-8000-000000000006',library='70000000-0000-4000-8000-000000000007';
test('Two isolated devices automatically receive word edits, profile changes and deletions without sync controls',async({browser})=>{
 const db=new LibraryDatabase('realtime-fixture-'+crypto.randomUUID());const repo=new LocalRepository(db,{kind:'account',id:`account:${owner}:${library}`,ownerId:owner,libraryId:library});await db.open();await repo.saveLesson({operationId:crypto.randomUUID(),title:'Fruit',learnedOn:'2026-10-12',sourceType:'manual',items:[{...catalog[0],id:'apple',approved:true}]});
 let sequence=0,preferences:Record<string,unknown>={};const changes:Pull['changes']=[],versions=new Map<string,number>(),sockets=new Map<WebSocketRoute,string>(),receipts=new Map<string,unknown>();
 for(const entity of cloudTables)for(const row of await db.table(entity).toArray()){versions.set(`${entity}:${row.id}`,1);changes.push({sequence:++sequence,entity,id:row.id,version:1,row});}await db.delete();
 const broadcast=()=>{for(const [socket,topic] of sockets)socket.send(JSON.stringify([null,null,topic,'broadcast',{event:'changed',payload:{sequence},type:'broadcast'}]));};
 async function connect(context:BrowserContext){
  await context.routeWebSocket('wss://fixture.supabase.co/realtime/v1/websocket*',socket=>{
   socket.onMessage(message=>{if(typeof message!=='string')return;const [join,ref,topic,event]=JSON.parse(message);if(event==='phx_join'){sockets.set(socket,topic);socket.send(JSON.stringify([join,ref,topic,'phx_reply',{status:'ok',response:{postgres_changes:[]}}]));}else if(event==='heartbeat')socket.send(JSON.stringify([join,ref,topic,'phx_reply',{status:'ok',response:{}}]));});socket.onClose(()=>sockets.delete(socket));
  });
  await context.route('**/api/**',async route=>{
   const request=route.request(),url=new URL(request.url());
   if(url.pathname==='/api/auth/status')return route.fulfill({json:{configured:true,user:{id:owner,name:'Fixture user',email:'fixture@example.test',avatarUrl:null},cloud:{state:'ready',words:1,lessons:1}}});
   if(url.pathname==='/api/cloud/library')return route.fulfill({json:{library:{id:library,ownerId:owner,name:'Fixture'}}});
   if(url.pathname==='/api/cloud/realtime')return route.fulfill({json:{url:'https://fixture.supabase.co',key:'public-fixture',accessToken:'fixture-access-only',ownerId:owner,libraryId:library,expiresAt:Date.now()/1000+600}});
   if(url.pathname==='/api/cloud/preferences'){if(request.method()==='POST'){preferences={...preferences,...request.postDataJSON().patch};broadcast();}return route.fulfill({json:{ownerId:owner,libraryId:library,preferences}});}
   if(url.pathname==='/api/cloud/sync'){
    if(request.method()==='GET'){const cursor=Number(url.searchParams.get('cursor'));const page=changes.filter(row=>row.sequence>cursor).slice(0,100);return route.fulfill({json:{libraryId:library,cursor:page.at(-1)?.sequence??cursor,changes:page,more:page.length===100}});}
    const packet=request.postDataJSON() as SyncRequest;if(receipts.has(packet.operationId))return route.fulfill({json:receipts.get(packet.operationId)});
    if(packet.items.some(item=>(versions.get(`${item.entity}:${(item.row as {id:string}).id}`)??0)!==item.baseVersion))return route.fulfill({status:409,json:{error:'conflict'}});
    const accepted=packet.items.map(item=>{const row=item.row as Record<string,unknown>,version=item.baseVersion+1;versions.set(`${item.entity}:${row.id}`,version);changes.push({sequence:++sequence,entity:item.entity,id:String(row.id),version,row});return {entity:cloudEntities[item.entity],id:row.id,version};});const result={ownerId:owner,libraryId:library,accepted};receipts.set(packet.operationId,result);await route.fulfill({json:result});broadcast();return;
   }
   return route.abort();
  });await context.route('https://generativelanguage.googleapis.com/**',route=>route.abort());
 }
 const a=await browser.newContext({baseURL:'http://127.0.0.1:4320',viewport:{width:1280,height:1000}}),b=await browser.newContext({baseURL:'http://127.0.0.1:4320',viewport:{width:360,height:800}});
 try{await Promise.all([connect(a),connect(b)]);const first=await a.newPage(),second=await b.newPage();await Promise.all([first.goto('/library/words/apple'),second.goto('/library/words/apple')]);await expect(first.getByRole('heading',{name:'quả táo',exact:true})).toBeVisible();await expect(second.getByRole('heading',{name:'quả táo',exact:true})).toBeVisible();await expect.poll(()=>sockets.size).toBe(2);
  await first.goto('/library/words/apple/edit');await first.getByLabel('Nghĩa tiếng Việt',{exact:true}).fill('táo đã sửa');const editAt=Date.now();await first.getByRole('button',{name:'Lưu chỉnh sửa',exact:true}).click();await expect(second.getByRole('heading',{name:'táo đã sửa',exact:true})).toBeVisible({timeout:5000});expect(Date.now()-editAt).toBeLessThan(5000);
  await Promise.all([first.goto('/add'),second.goto('/library')]);await expect.poll(()=>sockets.size).toBe(2);await first.getByRole('combobox').fill('nu');await first.getByRole('option').filter({hasText:'nut'}).getByRole('button').click();await first.getByRole('button',{name:'Lưu từ',exact:true}).click();await expect(second.locator('.library-list')).toContainText('nut',{timeout:5000});
  await Promise.all([first.goto('/library/groups/edit'),second.goto('/library/groups')]);await expect.poll(()=>sockets.size).toBe(2);await first.getByLabel('Tên nhóm',{exact:true}).fill('Nhóm đồng bộ');await first.getByRole('button',{name:/Chọn tất cả từ, câu và ngữ pháp/}).click();await first.getByRole('button',{name:'Lưu nhóm',exact:true}).click();await expect(second.getByRole('link',{name:/Nhóm đồng bộ/})).toBeVisible({timeout:5000});await second.getByRole('link',{name:/Nhóm đồng bộ/}).click();await expect(second.getByRole('heading',{name:'Nhóm đồng bộ',exact:true})).toBeVisible();await first.goto('/library/groups');await first.getByRole('link',{name:/Nhóm đồng bộ/}).click();await first.getByRole('button',{name:'Xóa nhóm',exact:true}).click();await first.getByRole('button',{name:'Xác nhận xóa',exact:true}).click();await expect(second.getByText('Chưa mở được nhóm này',{exact:true})).toBeVisible({timeout:5000});
  await Promise.all([first.goto('/profile'),second.goto('/profile')]);await expect.poll(()=>sockets.size).toBe(2);await first.getByLabel('Tên hiển thị',{exact:true}).fill('Bé Cloud');await first.getByRole('button',{name:'Lưu hồ sơ',exact:true}).click();await expect(second.getByLabel('Tên hiển thị',{exact:true})).toHaveValue('Bé Cloud',{timeout:5000});
  await Promise.all([first.goto('/library/words/apple'),second.goto('/library/words/apple')]);await expect.poll(()=>sockets.size).toBe(2);await first.getByRole('button',{name:'Xóa từ này',exact:true}).click();await first.getByRole('button',{name:'Xác nhận xóa',exact:true}).click();await expect(second.getByText('Không tìm thấy từ này',{exact:true})).toBeVisible({timeout:5000});expect(changes.some(change=>change.entity==='senses'&&(change.row as {deletedAt:string|null}).deletedAt)).toBe(true);
 }finally{await Promise.all([a.close(),b.close()]);}
});
