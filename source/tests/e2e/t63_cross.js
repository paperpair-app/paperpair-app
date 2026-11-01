const {launch,ok}=require('./base');
(async()=>{const {b,p,errs}=await launch();p.setDefaultTimeout(180000);let calls=0,first429=false,bodies=[];
 await p.route(/generativelanguage\.googleapis\.com/,async route=>{const req=route.request(),u=req.url();
   if(req.headers()["x-goog-api-key"]==="BAD")return route.fulfill({status:400,contentType:"application/json",body:JSON.stringify({error:{code:400,message:"API key not valid. Please pass a valid API key."}})});
   if(/\/models\?/.test(u))return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({models:[{name:"models/gemini-3.5-flash-lite",supportedGenerationMethods:["generateContent"]},{name:"models/gemini-3.8-flash",supportedGenerationMethods:["generateContent"]},{name:"models/gemini-3.8-flash-tts",supportedGenerationMethods:["generateContent"]},{name:"models/text-embedding",supportedGenerationMethods:["embedContent"]}]})});
   calls++;const body=JSON.parse(req.postData());bodies.push(u);
   if(first429){first429=false;return route.fulfill({status:429,contentType:"application/json",body:JSON.stringify({error:{code:429,message:"Resource exhausted, per minute",details:[{"@type":"type.googleapis.com/google.rpc.RetryInfo",retryDelay:"1s"}]}})})}
   const lines=body.contents[0].parts[0].text.split("\n").filter(l=>/^\d+\.\d+ /.test(l)).map(l=>{const m=l.match(/^(\S+)(?: \[b\])? \[x\d+\] (.*)$/);return{id:m[1],t:m[2]}});
   const items=[];let lastQ=null;
   lines.forEach((l,i)=>{let m;if(m=l.t.match(/^Illustration\s+(\d+)/i)){lastQ=m[1];items.push({kind:"q",start:l.id,end:"CONT",label:m[1],group:"Illustration",i})}
     else if(/^Solution\b/i.test(l.t)){items.push({kind:"a",start:l.id,end:"CONT",label:lastQ||"",group:"Illustration",i})}});
   items.forEach((it,k)=>{const nx=k+1<items.length?items[k+1].i:lines.length;for(let j=it.i+1;j<nx;j++)if(/^\*{3,}/.test(lines[j].t)){it.end=lines[j-1].id;break}
     if(it.end==="CONT"&&k+1<items.length)it.end=lines[nx-1].id;if(it.kind==='a'&&it.label==='3')it.end=it.start;delete it.i});
   const items2=items.filter(x=>x.label!=='5');
   route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify({items:items2})}]}}]})})});
 await p.setInputFiles('#fileIn',['/tmp/e2e/pdfs/Ind_AS_7.pdf']);await p.waitForSelector("#vMark:not([hidden]) canvas.pc");
 await p.click("#autoBtn");await p.waitForSelector("#adAI");
 ok(await p.$eval(".aibox .aik",e=>e.hidden),"key field hidden until AI is ticked");
 await p.check("#adAI");await p.fill("#adAIKey","GOODKEY");await p.click("#adAITest");await p.waitForTimeout(600);
 const st=await p.$eval("#adAIModel",s=>[...s.options].map(o=>o.value).join(","));ok(st===",gemini-3.8-flash,gemini-3.5-flash-lite","models listed, newest Flash first, no tts: "+st);
 await p.click("#adGo");await p.waitForFunction(()=>(S.sugg||[]).length>0||document.querySelector("#adRes .failx"),null,{timeout:120000});
 const r=await p.evaluate(()=>{const sg=S.sugg,st=chkStats(sg);return{n:sg.length,fl:sg.map(x=>({l:x.label,f:(x.xflag||[]).join(" | ")})).filter(x=>x.f),log:LOG.text?"":""}});console.log(JSON.stringify(r,null,0).slice(0,1500));
 const t=await p.evaluate(()=>[...document.querySelectorAll(".toast,#toast")].map(e=>e.textContent).join(" "));console.log("toast:",t.slice(0,200));
 ok(r.fl.some(x=>x.l==="3"&&/answer/.test(x.f)),"a wrong answer end is flagged");
 ok(r.fl.some(x=>/AI missed/.test(x.f)),"a question the AI missed is added and flagged");
 ok(r.n>=12,"suggestions kept: "+r.n);

 // bad key falls back
 await p.evaluate(()=>{S.sugg=[];refreshAll();AI.set({key:"BAD",model:""})});
 await p.evaluate(()=>openAutoDetect());await p.waitForSelector("#adGo");await p.click("#adGo");await p.waitForTimeout(8000);
 const fb=await p.evaluate(()=>({n:(S.sugg||[]).length,fail:!!document.querySelector("#adRes .failx"),txt:(document.querySelector("#adRes")||{}).textContent||""}));
 ok(fb.n>0||/AI \(Gemini\)/.test(fb.txt),"bad key falls back to PaperPair's own methods: "+JSON.stringify({n:fb.n,fail:fb.fail}));
 const e=errs.filter(x=>!/Failed to load resource/.test(x));ok(!e.length,"no page errors "+e.join("|").slice(0,300));await b.close()})();
