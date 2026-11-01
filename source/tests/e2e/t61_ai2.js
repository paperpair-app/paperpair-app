const {launch,ok}=require('./base');
(async()=>{const {b,p,errs}=await launch();p.setDefaultTimeout(180000);let calls=0,first429=false,bodies=[],models=[],cut=true;
 await p.route(/generativelanguage\.googleapis\.com/,async route=>{const req=route.request(),u=req.url();
   if(req.headers()["x-goog-api-key"]==="BAD")return route.fulfill({status:400,contentType:"application/json",body:JSON.stringify({error:{code:400,message:"API key not valid. Please pass a valid API key."}})});
   if(/\/models\?/.test(u))return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({models:[{name:"models/gemini-3.5-flash-lite",supportedGenerationMethods:["generateContent"]},{name:"models/gemini-3.8-flash",supportedGenerationMethods:["generateContent"]},{name:"models/gemini-3.8-flash-tts",supportedGenerationMethods:["generateContent"]},{name:"models/text-embedding",supportedGenerationMethods:["embedContent"]}]})});
   calls++;const body=JSON.parse(req.postData());bodies.push(u);models.push(u.match(/models\/([^:]+)/)[1]);
   if(/3\.8-flash:/.test(u))return route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({error:{code:429,message:'Quota exceeded',details:[{'@type':'type.googleapis.com/google.rpc.QuotaFailure',violations:[{quotaId:'GenerateRequestsPerDayPerProjectPerModel-FreeTier'}]}]}})});
   if(cut){cut=false;return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'{"items":[{"kind":"q","sta'}]}}]})})}
   if(first429){first429=false;return route.fulfill({status:429,contentType:"application/json",body:JSON.stringify({error:{code:429,message:"Resource exhausted, per minute",details:[{"@type":"type.googleapis.com/google.rpc.RetryInfo",retryDelay:"1s"}]}})})}
   const lines=body.contents[0].parts[0].text.split("\n").filter(l=>/^\d+\.\d+ /.test(l)).map(l=>{const m=l.match(/^(\S+)(?: \[b\])? \[x\d+\] (.*)$/);return{id:m[1],t:m[2]}});
   const items=[];let lastQ=null;
   lines.forEach((l,i)=>{let m;if(m=l.t.match(/^Illustration\s+(\d+)/i)){lastQ=m[1];items.push({kind:"q",start:l.id,end:"CONT",label:m[1],group:"Illustration",i})}
     else if(/^Solution\b/i.test(l.t)){items.push({kind:"a",start:l.id,end:"CONT",label:lastQ||"",group:"Illustration",i})}});
   items.forEach((it,k)=>{const nx=k+1<items.length?items[k+1].i:lines.length;for(let j=it.i+1;j<nx;j++)if(/^\*{3,}/.test(lines[j].t)){it.end=lines[j-1].id;break}
     if(it.end==="CONT"&&k+1<items.length)it.end=lines[nx-1].id;delete it.i});
   route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify({items})}]}}]})})});
 await p.setInputFiles('#fileIn',['/tmp/e2e/pdfs/Ind_AS_7.pdf']);await p.waitForSelector("#vMark:not([hidden]) canvas.pc");
 await p.click("#autoBtn");await p.waitForSelector("#adAI");
 ok(await p.$eval(".aibox .aik",e=>e.hidden),"key field hidden until AI is ticked");
 await p.check("#adAI");await p.fill("#adAIKey","GOODKEY");await p.click("#adAITest");await p.waitForTimeout(600);
 const st=await p.$eval("#adAIModel",s=>[...s.options].map(o=>o.value).join(","));ok(st===",gemini-3.8-flash,gemini-3.5-flash-lite","models listed, newest Flash first, no tts: "+st);
 await p.click("#adGo");await p.waitForFunction(()=>(S.sugg||[]).length>0||document.querySelector("#adRes .failx"),null,{timeout:120000});
 const r=await p.evaluate(()=>({n:S.sugg.length,withA:S.sugg.filter(s=>s.a.length).length,lab:S.sugg.map(s=>s.label).join(",")}));console.log(JSON.stringify(r),"calls",calls);
 ok(r.n>=10&&r.withA===r.n,"AI result became suggestions with answers: "+r.n);console.log(JSON.stringify(models));ok(models[0]==="gemini-3.8-flash"&&models.slice(1).every(m=>m==="gemini-3.5-flash-lite"),"daily limit switches to the next model");ok(models.length>=4,"a cut-off answer is split and re-asked: "+models.length+" calls");
 const sent=await p.evaluate(()=>LOG&&LOG.text?LOG.text():"");
 // end at *****: answer box must stop above the ***** line
 const chk=await p.evaluate(async()=>{const s=S.sugg[0],a=s.a.at(-1);const P=await readPages([a.page],null,true);const star=P.get(a.page).content.find(l=>/^\*{3,}/.test(l.text.trim())&&l.y0>a.y);return star?{boxEnd:a.y+a.h,star:star.y0}:null});
 ok(!chk||chk.boxEnd<=chk.star+.002,"answer box stops before ***** "+JSON.stringify(chk));
 // bad key falls back
 await p.evaluate(()=>{S.sugg=[];refreshAll();AI.set({key:"BAD",model:""})});
 await p.evaluate(()=>openAutoDetect());await p.waitForSelector("#adGo");await p.click("#adGo");await p.waitForTimeout(8000);
 const fb=await p.evaluate(()=>({n:(S.sugg||[]).length,fail:!!document.querySelector("#adRes .failx"),txt:(document.querySelector("#adRes")||{}).textContent||""}));
 ok(fb.n>0||/AI \(Gemini\)/.test(fb.txt),"bad key falls back to PaperPair's own methods: "+JSON.stringify({n:fb.n,fail:fb.fail}));
 const e=errs.filter(x=>!/Failed to load resource/.test(x));ok(!e.length,"no page errors "+e.join("|").slice(0,300));await b.close()})();
