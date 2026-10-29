import {mkdirSync,writeFileSync} from 'node:fs';
import {generateShadow} from '../src/lib/ai/shadowing';
import {wordExtensionSource,extensionHash} from '../src/lib/learning/extensions';
import {defaultParentModel} from '../src/lib/ai/byok';
process.loadEnvFile('.env.local');
const source=wordExtensionSource({word:'apple',pos:'noun',sense:'fruit',en:'A round fruit.',vi:'quả táo',example:'I eat an apple.'}),at=new Date().toISOString();
const payload=await generateShadow({scopeId:'guest:synthetic',id:'shadow:synthetic',version:1,createdAt:at,updatedAt:at,deletedAt:null,payload:{kind:'sense',senseId:'synthetic',targetId:'synthetic',source,sourceHash:await extensionHash(source),model:'pending',promptVersion:1,levels:[{level:'basic',sentences:[],reason:''},{level:'B1',sentences:[],reason:''},{level:'B2',sentences:[],reason:''}],decisions:{},edited:false,status:'queued',error:null}},AbortSignal.timeout(45000),{key:process.env.NEXT_PUBLIC_GEMINI_DEFAULT_KEY!,model:defaultParentModel});
mkdirSync('.local/shadowing-smoke',{recursive:true});writeFileSync('.local/shadowing-smoke/generated.json',JSON.stringify(payload,null,2),{mode:0o600});console.log(JSON.stringify({status:payload.status,levels:payload.levels.map(l=>({level:l.level,count:l.sentences.length})),requests:1,accountContentSent:false,autoapproved:false}));
