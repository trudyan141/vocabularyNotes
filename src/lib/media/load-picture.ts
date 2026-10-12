// Decode the image, rather than treating catalog metadata or HTTP 200 as readiness.
export function loadPicture(src:string):Promise<boolean>{
  if(typeof Image==='undefined')return Promise.resolve(false);
  return new Promise(resolve=>{
    const image=new Image();
    const finish=(ready:boolean)=>{clearTimeout(timer);image.onload=null;image.onerror=null;resolve(ready);};
    const timer=setTimeout(()=>finish(false),8000);
    image.onerror=()=>finish(false);
    image.onload=()=>{if(!image.naturalWidth||!image.naturalHeight){finish(false);return;}image.decode().then(()=>finish(true),()=>finish(false));};
    image.src=src;
  });
}
