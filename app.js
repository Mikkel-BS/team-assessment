(() => {
"use strict";
const V="1.0.0", S=[[1,"Strongly disagree"],[2,"Disagree"],[3,"Neither"],[4,"Agree"],[5,"Strongly agree"]];
const D=[
["safety","Psychological safety","Speaking up and interpersonal risk-taking",[
"People on this team can raise concerns or unpopular views without being punished or dismissed.",
"When someone makes a mistake, we focus on learning and correction rather than blame.",
"It is easy to ask teammates for help, clarification, or feedback when needed."]],
["direction","Shared direction & mental models","Goals, priorities, roles, and shared understanding",[
"We have a clear, shared understanding of what the team is trying to accomplish.",
"People understand their responsibilities and how their work connects with others' work.",
"When priorities compete, we generally agree on what matters most."]],
["coordination","Communication & coordination","Information flow and synchronized execution",[
"Important information reaches the people who need it in time to act.",
"We coordinate interdependent tasks explicitly rather than relying on assumptions.",
"We confirm key decisions, handoffs, and expectations when ambiguity could cause problems."]],
["monitoring","Mutual monitoring & accountability","Progress awareness and constructive follow-through",[
"We have enough visibility into one another's progress to identify problems early.",
"Team members constructively challenge missed commitments or slipping standards.",
"People reliably follow through on commitments they make to the team."]],
["support","Backup & mutual support","Helping and reallocating effort when needed",[
"When someone is overloaded, teammates step in or help rebalance the work.",
"People share useful expertise and resources rather than protecting their own area.",
"We notice when another teammate needs support and respond before it becomes a larger problem."]],
["adaptability","Adaptability & learning","Learning loops and adjustment to changing conditions",[
"We adjust plans when new information shows that our current approach is not working.",
"We routinely reflect on outcomes and turn lessons into changes in how we work.",
"The team can adapt roles, priorities, or coordination patterns when circumstances change."]],
["trust","Trust & team orientation","Collective success, constructive intent, and contribution",[
"People generally assume constructive intent from teammates, even during disagreement.",
"Team members prioritize the team's overall success over protecting their own territory.",
"We actively use different perspectives and expertise rather than defaulting to the loudest voice."]],
["enabling","Enabling conditions & leadership","Structure, resources, coaching, and context",[
"The team has the authority, resources, and access it needs to do its work well.",
"Leadership—formal or shared—helps remove obstacles and keeps the team focused without micromanaging.",
"Our working routines and decision processes support effective collaboration rather than creating friction."]]
];
const O=["outcomes","Team outcomes","Current effectiveness indicators",[
"The team consistently produces work that meets or exceeds the quality required.",
"We use time and effort effectively rather than losing substantial energy to avoidable coordination problems.",
"Working on this team strengthens rather than depletes our ability to work together in the future.",
"The team is improving its capability over time, not merely delivering the next task."
]];
const $=s=>document.querySelector(s), mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
const sd=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1))};
const rnd=n=>Number(n.toFixed(2)), pct=n=>Math.max(0,Math.min(100,(n-1)*25));
const meta=[]; D.forEach(d=>d[3].forEach((t,i)=>meta.push([d[0]+"_"+(i+1),d[0],t]))); O[3].forEach((t,i)=>meta.push(["outcomes_"+(i+1),"outcomes",t]));
let individual=null, team=null;
function band(n){return n<2.5?"constrained":n<3.5?"developing":n<4.25?"strong":"distinct strength"}
function disp(n){return n>=.8?["high","mixed experience"]:n>=.5?["med","some variation"]:["low","relatively consistent"]}
function renderQuestions(){
 const c=$("#questionList"); c.innerHTML="";
 [...D,O].forEach((d,di)=>{
  const sec=document.createElement("section");sec.className="dimension-block";
  sec.innerHTML='<div class="dimension-title"><h3>'+(di+1)+'. '+d[1]+'</h3><span>'+d[2]+'</span></div>';
  d[3].forEach((t,i)=>{const key=d[0]+"_"+(i+1), card=document.createElement("div");card.className="question-card";card.dataset.key=key;
   card.innerHTML="<p>"+t+"</p><div class=\"likert\">"+S.map(x=>'<label><input type="radio" name="'+key+'" value="'+x[0]+'" aria-label="'+x[1]+'"><span>'+x[1]+"</span></label>").join("")+"</div>";sec.appendChild(card)});
  c.appendChild(sec)
 })
}
function answers(){const a={};meta.forEach(q=>{const x=document.querySelector('input[name="'+q[0]+'"]:checked');if(x)a[q[0]]=+x.value});return a}
function progress(){const n=Object.keys(answers()).length,p=Math.round(n/meta.length*100);$("#progressText").textContent=n+" of "+meta.length+" answered";$("#progressPct").textContent=p+"%";$("#progressBar").style.width=p+"%"}
function calc(a){const ds={};D.forEach(d=>ds[d[0]]=rnd(mean(d[3].map((_,i)=>a[d[0]+"_"+(i+1)]))));const out=rnd(mean(O[3].map((_,i)=>a["outcomes_"+(i+1)])));return{version:V,createdAt:new Date().toISOString(),scores:{dimensions:ds,functioningIndex:rnd(mean(Object.values(ds))),outcomes:out}}}
function narrative(s,isTeam){const e=D.map(d=>({n:d[1],v:s.dimensions[d[0]]})).sort((a,b)=>b.v-a.v);return(isTeam?"The aggregate profile":"Your ratings")+" is "+band(s.functioningIndex)+" overall ("+s.functioningIndex.toFixed(2)+"/5). The strongest area is "+e[0].n+" ("+e[0].v.toFixed(2)+"), while the clearest development opportunity is "+e.at(-1).n+" ("+e.at(-1).v.toFixed(2)+"). Outcome indicators average "+s.outcomes.toFixed(2)+"/5."}
function bars(el,ds,spread){el.innerHTML="";D.forEach(d=>{const v=ds[d[0]],row=document.createElement("div");row.className="score-row";let extra="";if(spread){const z=disp(spread[d[0]]);extra='<span class="disagreement"><i class="dot '+z[0]+'"></i>'+z[1]+" · SD "+spread[d[0]].toFixed(2)+"</span>"}row.innerHTML='<div class="score-label"><strong>'+d[1]+"</strong><small>"+band(v)+"</small>"+extra+'</div><div class="bar-track"><div class="bar-fill" style="width:'+pct(v)+'%"></div></div><div class="score-value">'+v.toFixed(2)+" / 5</div>";el.appendChild(row)})}
function download(name,text,type){const a=document.createElement("a"),u=URL.createObjectURL(new Blob([text],{type}));a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
async function copy(t){try{await navigator.clipboard.writeText(t)}catch{const x=document.createElement("textarea");x.value=t;document.body.appendChild(x);x.select();document.execCommand("copy");x.remove()}}
function valid(x){return x&&x.schema==="team-functioning-summary-response"&&x.scores&&D.every(d=>Number.isFinite(x.scores.dimensions?.[d[0]])&&x.scores.dimensions[d[0]]>=1&&x.scores.dimensions[d[0]]<=5)&&Number.isFinite(x.scores.outcomes)&&x.scores.outcomes>=1&&x.scores.outcomes<=5}
function aggregate(xs){const dims={},spread={};D.forEach(d=>{const a=xs.map(x=>x.scores.dimensions[d[0]]);dims[d[0]]=rnd(mean(a));spread[d[0]]=rnd(sd(a))});return{n:xs.length,dimensions:dims,dispersion:spread,outcomes:rnd(mean(xs.map(x=>x.scores.outcomes))),functioningIndex:rnd(mean(Object.values(dims)))}}
function indPrompt(r){return "You are an organizational psychologist and team-effectiveness facilitator. Analyze this one-person, research-informed team assessment conservatively. Do not infer motives, personality, mental health, or blame. Treat scores as descriptive, not normative. Identify plausible hypotheses rather than certainties and suggest low-risk 2–4 week experiments.\n\nScores (1–5):\n"+D.map(d=>"- "+d[1]+": "+r.scores.dimensions[d[0]].toFixed(2)).join("\n")+"\n- Outcome indicators: "+r.scores.outcomes.toFixed(2)+"\n- Functioning index: "+r.scores.functioningIndex.toFixed(2)+"\n\nReturn: executive summary; three key patterns; two strengths; up to three priorities; one experiment and success signal per priority; three discussion questions; and a caution about uncertainty and single-respondent data."}
function teamPrompt(t){return "You are an organizational psychologist and team-effectiveness facilitator. Analyze this anonymous aggregate team assessment conservatively. N="+t.n+". Scores are descriptive, not norm-referenced; this adapted questionnaire is not separately validated. Do not infer motives, personality, mental health, identity, or subgroups. Treat dispersion as a signal of uneven experience, not proof of conflict. Prefer system/process hypotheses and low-risk 2–4 week experiments.\n\nAggregate scores (1–5):\n"+D.map(d=>"- "+d[1]+": mean "+t.dimensions[d[0]].toFixed(2)+", respondent SD "+t.dispersion[d[0]].toFixed(2)).join("\n")+"\n- Outcome indicators: "+t.outcomes.toFixed(2)+"\n- Functioning index: "+t.functioningIndex.toFixed(2)+"\n\nReturn: 150-word executive summary; 3–5 important patterns; strengths; development priorities distinguishing low mean from high disagreement; one experiment, owner type and success signal per priority; three facilitation questions; evidence that would reduce uncertainty; and a short caution about sample size, aggregation and self-report."}
function csv(t){const r=[["Dimension","Mean","Respondent SD","Interpretive band","Disagreement flag"]];D.forEach(d=>r.push([d[1],t.dimensions[d[0]].toFixed(2),t.dispersion[d[0]].toFixed(2),band(t.dimensions[d[0]]),disp(t.dispersion[d[0]])[1]]));r.push(["Outcome indicators",t.outcomes.toFixed(2),"",band(t.outcomes),""]);r.push(["Functioning index",t.functioningIndex.toFixed(2),"",band(t.functioningIndex),""]);r.push(["Response count",t.n,"","",""]);return r.map(a=>a.map(v=>{v=String(v);return /[",\n]/.test(v)?'"'+v.replaceAll('"','""')+'"':v}).join(",")).join("\n")}
$("#beginBtn").onclick=()=>{$("#assessmentStart").classList.add("hidden");$("#assessmentForm").classList.remove("hidden");$("#assessmentForm").scrollIntoView({behavior:"smooth"})};
$("#assessmentForm").addEventListener("change",progress);
$("#assessmentForm").addEventListener("submit",e=>{e.preventDefault();const a=answers();if(Object.keys(a).length!==meta.length){$("#formError").textContent="Please answer all 28 statements before viewing results.";const q=meta.find(x=>!a[x[0]]);document.querySelector('[data-key="'+q[0]+'"]')?.scrollIntoView({behavior:"smooth",block:"center"});return}$("#formError").textContent="";individual=calc(a);$("#individualIndex").textContent=individual.scores.functioningIndex.toFixed(2);$("#individualSummary").textContent=narrative(individual.scores,false);bars($("#individualBars"),individual.scores.dimensions);$("#individualResults").classList.remove("hidden");$("#individualResults").scrollIntoView({behavior:"smooth"})});
$("#resetBtn").onclick=()=>{$("#assessmentForm").reset();individual=null;$("#individualResults").classList.add("hidden");$("#formError").textContent="";progress()};
$("#retakeBtn").onclick=$("#resetBtn").onclick;
$("#exportResponseBtn").onclick=()=>{if(!individual)return;download("team-response-"+new Date().toISOString().slice(0,10)+".json",JSON.stringify({schema:"team-functioning-summary-response",version:individual.version,createdAt:individual.createdAt,scale:{min:1,max:5},scores:{dimensions:individual.scores.dimensions,outcomes:individual.scores.outcomes}},null,2),"application/json");$("#individualActionStatus").textContent="Anonymous response exported: dimension/outcome scores only; no raw answers or identifiers."};
$("#copyIndividualPromptBtn").onclick=async()=>{if(individual){await copy(indPrompt(individual));$("#individualActionStatus").textContent="LLM prompt copied. Nothing was sent by this site."}};
$("#teamFiles").addEventListener("change",async e=>{const fs=[...(e.target.files||[])],ok=[],bad=[];team=null;$("#teamResults").classList.add("hidden");for(const f of fs){try{const x=JSON.parse(await f.text());valid(x)?ok.push(x):bad.push(f.name)}catch{bad.push(f.name)}}if(!ok.length){$("#fileStatus").textContent="No valid response files found"+(bad.length?". Rejected: "+bad.join(", "):"");return}team=aggregate(ok);$("#fileStatus").textContent=ok.length+" valid response"+(ok.length===1?"":"s")+" loaded"+(bad.length?"; "+bad.length+" invalid file(s) ignored":"")+".";
$("#responseCount").textContent=team.n;$("#teamIndex").textContent=team.functioningIndex.toFixed(2);$("#teamSummary").textContent=narrative({dimensions:team.dimensions,functioningIndex:team.functioningIndex,outcomes:team.outcomes},true);bars($("#teamBars"),team.dimensions,team.dispersion);const w=$("#smallNWarning");if(team.n<4){w.textContent="Small sample: treat this aggregate as exploratory and be cautious about confidentiality and disagreement.";w.classList.remove("hidden")}else w.classList.add("hidden");$("#teamResults").classList.remove("hidden");$("#teamResults").scrollIntoView({behavior:"smooth"})});
$("#copyTeamPromptBtn").onclick=async()=>{if(team){await copy(teamPrompt(team));$("#teamActionStatus").textContent="Aggregate LLM prompt copied. Only summary statistics are included."}};
$("#exportTeamCsvBtn").onclick=()=>{if(team){download("team-summary-"+new Date().toISOString().slice(0,10)+".csv",csv(team),"text/csv;charset=utf-8");$("#teamActionStatus").textContent="Team summary exported as CSV."}};
$("#clearTeamBtn").onclick=()=>{team=null;$("#teamFiles").value="";$("#teamResults").classList.add("hidden");$("#fileStatus").textContent="Imported team data cleared from page memory.";$("#teamActionStatus").textContent=""};
renderQuestions();progress();
})();