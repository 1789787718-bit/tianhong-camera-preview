const form=document.querySelector('#preview-unlock'),field=document.querySelector('#password'),error=document.querySelector('#unlock-error'),encrypted=JSON.parse(document.querySelector('#encrypted-preview').textContent);
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
form.addEventListener('submit',async event=>{
 event.preventDefault();const button=form.querySelector('button');button.disabled=true;error.textContent='';let password=field.value;field.value='';
 try{
  const raw=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);password='';
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(encrypted.salt),iterations:encrypted.iterations,hash:'SHA-256'},raw,{name:'AES-GCM',length:256},false,['decrypt']);
  const decoded=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(encrypted.iv)},key,bytes(encrypted.ciphertext)),payload=JSON.parse(new TextDecoder().decode(decoded));
  document.querySelectorAll('link[rel="stylesheet"]').forEach(el=>el.remove());const style=document.createElement('style');style.textContent=payload.css;document.head.append(style);document.title=payload.title;document.body.innerHTML=payload.body;
  const urls={},compile=(name)=>{const code=payload.source[name].replace(/from (['"])\.\/([a-z]+)\.js\1/g,(_,quote,dep)=>'from '+JSON.stringify(urls[dep]));urls[name]=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));};
  for(const name of ['state','data','preview','camera','app'])compile(name);
  if(!location.hash)location.hash='/devices/camera';const script=document.createElement('script');script.type='module';script.src=urls.app;document.body.append(script);
  document.addEventListener('click',e=>{if(e.target.closest('[data-preview-lock]'))location.reload()});
 }catch(e){password='';error.textContent='密码不正确，或浏览器不支持加密解锁。';button.disabled=false;field.focus()}
});
