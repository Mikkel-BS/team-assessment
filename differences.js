(() => {
"use strict";

const VERSION = "1.0.0";
const MIN_TEAM_N = 5;
const SCALE = [[1,"Very inaccurate"],[2,"Moderately inaccurate"],[3,"Neither"],[4,"Moderately accurate"],[5,"Very accurate"]];

const PERSONALITY = [
["extraversion","Extraversion","social energy and outward engagement",[["Am the life of the party.",1],["Don't talk a lot.",-1],["Talk to a lot of different people at parties.",1],["Keep in the background.",-1]]],
["agreeableness","Agreeableness","cooperation, compassion, and interpersonal warmth",[["Sympathize with others' feelings.",1],["Am not interested in other people's problems.",-1],["Feel others' emotions.",1],["Am not really interested in others.",-1]]],
["conscientiousness","Conscientiousness","organization, follow-through, and self-discipline",[["Get chores done right away.",1],["Often forget to put things back in their proper place.",-1],["Like order.",1],["Make a mess of things.",-1]]],
["stability","Emotional stability","relative calm and resilience under stress",[["Have frequent mood swings.",-1],["Am relaxed most of the time.",1],["Get upset easily.",-1],["Seldom feel blue.",1]]],
["openness","Openness / imagination","imagination and interest in abstract ideas",[["Have a vivid imagination.",1],["Am not interested in abstract ideas.",-1],["Have difficulty understanding abstract ideas.",-1],["Do not have a good imagination.",-1]]]
];

const VALUES = [
["care","Care","concern about suffering and protection from harm",["When deciding what is right, preventing unnecessary suffering matters greatly to me.","I feel a strong moral pull to protect people who are vulnerable or being harmed.","Compassion for those who are hurt or struggling is central to my moral judgments."]],
["equality","Equality","equal standing and opposition to unfair disadvantage",["I care strongly that people have equal standing and are not treated as inherently worth less than others.","Large unfair inequalities feel morally important to me, even when they follow accepted rules.","When judging an arrangement, I pay close attention to whether some people are systematically disadvantaged."]],
["proportionality","Proportionality","rewards and responsibilities matching contribution or merit",["I think fairness often means that rewards should reflect effort, contribution, or merit.","It matters to me that people receive benefits in proportion to what they contribute.","When responsibilities are shared, I value an allocation that reflects each person's contribution and obligations."]],
["loyalty","Loyalty","commitment and responsibility toward one's groups",["Standing by a group I genuinely belong to can be a moral obligation, not just a preference.","I place moral value on people supporting their group when it faces external pressure.","Reciprocal loyalty among members is an important part of a healthy community."]],
["authority","Authority","legitimate roles, rules, and ordered social relationships",["Respect for legitimate authority can be morally important when it helps a group function well.","I think people sometimes have a moral responsibility to respect established roles and duties.","A well-functioning community often depends on accepting some legitimate hierarchy or authority."]],
["purity","Purity / sanctity","protecting what is regarded as sacred, dignified, or degrading",["Some actions can feel morally wrong because they violate a sense of human dignity or sanctity, even when direct harm is unclear.","I think moral judgment can properly include concerns about degradation, corruption, or defilement.","Protecting things a community regards as sacred can sometimes be a genuine moral concern."]]
];

const PERSONALITY_PROMPTS = {
extraversion:"How can we make space for both people who think aloud and people who prefer time to reflect before contributing?",
agreeableness:"How should we distinguish constructive challenge from unnecessary interpersonal friction, given different preferences for harmony?",
conscientiousness:"Where do we need explicit structure and planning, and where is flexibility more valuable?",
stability:"How can we design communication and workload practices that work for teammates who differ in sensitivity to pressure and uncertainty?",
openness:"Where should we deliberately encourage exploration and novel ideas, and where should we converge quickly on proven approaches?"
};
const VALUE_PROMPTS = {
care:"When difficult trade-offs arise, how should we weigh protection from harm against other legitimate considerations?",
equality:"Where does the team need equal treatment, and where might identical treatment overlook meaningful differences in circumstances?",
proportionality:"How should contribution, effort, responsibility, and outcomes influence what the team considers fair?",
loyalty:"What do we owe teammates and the team as a whole when loyalty conflicts with candor, external obligations, or wider interests?",
authority:"Which decisions benefit from clear authority, and which should remain participatory or challengeable?",
purity:"Are there practices, standards, or boundaries that some teammates see as matters of dignity or principle while others see them as pragmatic choices?"
};

const $ = s => document.querySelector(s);
const mean = a => a.reduce((x,y)=>x+y,0)/a.length;
const sd = a => { if(a.length<2)return 0; const m=mean(a); return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1)); };
const round = n => Number(n.toFixed(2));
const pct = n => Math.max(0,Math.min(100,(n-1)*25));
const keyed = (v,dir) => dir===1?v:6-v;
const dispersionLabel = n => n>=0.8?["high","substantial variation"]:n>=0.5?["med","meaningful variation"]:["low","relatively similar"];

let individual=null, team=null;
const itemMeta=[];

function sectionTitle(title,note){
 const el=document.createElement("div"); el.className="section-divider";
 el.innerHTML="<h3>"+title+"</h3><span>"+note+"</span>"; return el;
}
function questionCard(key,text){
 const card=document.createElement("div"); card.className="question-card"; card.dataset.key=key;
 card.innerHTML="<p>"+text+"</p><div class=\"likert\">"+SCALE.map(x=>'<label><input type="radio" name="'+key+'" value="'+x[0]+'" aria-label="'+x[1]+'"><span>'+x[1]+"</span></label>").join("")+"</div>";
 return card;
}
function renderQuestions(){
 const root=$("#differencesQuestionList"); root.innerHTML="";
 root.appendChild(sectionTitle("Part 1 · Personality","20 Mini-IPIP items"));
 let i=0;
 PERSONALITY.forEach(d=>d[3].forEach(q=>{i++;const key="p_"+d[0]+"_"+i;itemMeta.push({key:key,type:"personality",dim:d[0],dir:q[1]});root.appendChild(questionCard(key,q[0]));}));
 root.appendChild(sectionTitle("Part 2 · Moral priorities","18 adapted items"));
 let j=0;
 VALUES.forEach(d=>d[3].forEach(text=>{j++;const key="v_"+d[0]+"_"+j;itemMeta.push({key:key,type:"values",dim:d[0],dir:1});root.appendChild(questionCard(key,text));}));
}
function getAnswers(){
 const out={}; itemMeta.forEach(m=>{const x=document.querySelector('input[name="'+m.key+'"]:checked');if(x)out[m.key]=+x.value;}); return out;
}
function updateProgress(){
 const n=Object.keys(getAnswers()).length,p=Math.round(n/itemMeta.length*100);
 $("#differencesProgressText").textContent=n+" of "+itemMeta.length+" answered"; $("#differencesProgressPct").textContent=p+"%"; $("#differencesProgressBar").style.width=p+"%";
}
function scoreIndividual(a){
 const personality={},values={};
 PERSONALITY.forEach(d=>{const v=itemMeta.filter(m=>m.type==="personality"&&m.dim===d[0]).map(m=>keyed(a[m.key],m.dir));personality[d[0]]=round(mean(v));});
 VALUES.forEach(d=>{const v=itemMeta.filter(m=>m.type==="values"&&m.dim===d[0]).map(m=>a[m.key]);values[d[0]]=round(mean(v));});
 return {personality:personality,values:values};
}
function renderBars(el,defs,scores,spread){
 el.innerHTML="";
 defs.forEach(d=>{const v=scores[d[0]],row=document.createElement("div");row.className="score-row";let extra="";
 if(spread){const tag=dispersionLabel(spread[d[0]]);extra='<span class="disagreement"><i class="dot '+tag[0]+'"></i>'+tag[1]+' · SD '+spread[d[0]].toFixed(2)+"</span>";}
 row.innerHTML='<div class="score-label"><strong>'+d[1]+"</strong><small>"+d[2]+"</small>"+extra+'</div><div class="bar-track"><div class="bar-fill" style="width:'+pct(v)+'%"></div></div><div class="score-value">'+v.toFixed(2)+" / 5</div>";el.appendChild(row);});
}
function download(name,text,type){const a=document.createElement("a"),u=URL.createObjectURL(new Blob([text],{type:type}));a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);}
async function copyText(t){try{await navigator.clipboard.writeText(t);}catch{const x=document.createElement("textarea");x.value=t;document.body.appendChild(x);x.select();document.execCommand("copy");x.remove();}}
function validFile(x){
 return !!(x&&x.schema==="team-differences-summary-response"&&x.version===VERSION&&x.scores&&PERSONALITY.every(d=>Number.isFinite(x.scores.personality?.[d[0]])&&x.scores.personality[d[0]]>=1&&x.scores.personality[d[0]]<=5)&&VALUES.every(d=>Number.isFinite(x.scores.values?.[d[0]])&&x.scores.values[d[0]]>=1&&x.scores.values[d[0]]<=5));
}
function aggregate(xs){
 const pm={},ps={},vm={},vs={};
 PERSONALITY.forEach(d=>{const a=xs.map(x=>x.scores.personality[d[0]]);pm[d[0]]=round(mean(a));ps[d[0]]=round(sd(a));});
 VALUES.forEach(d=>{const a=xs.map(x=>x.scores.values[d[0]]);vm[d[0]]=round(mean(a));vs[d[0]]=round(sd(a));});
 return {n:xs.length,personality:{mean:pm,sd:ps},values:{mean:vm,sd:vs}};
}
function highest(defs,spread){return defs.map(d=>({key:d[0],name:d[1],sd:spread[d[0]]})).sort((a,b)=>b.sd-a.sd)[0];}
function renderPrompts(t){
 const p=highest(PERSONALITY,t.personality.sd),v=highest(VALUES,t.values.sd);
 const all=PERSONALITY.map(d=>({type:"p",key:d[0],sd:t.personality.sd[d[0]]})).concat(VALUES.map(d=>({type:"v",key:d[0],sd:t.values.sd[d[0]]}))).sort((a,b)=>b.sd-a.sd);
 const secondary=all.find(x=>!(x.type==="p"&&x.key===p.key)&&!(x.type==="v"&&x.key===v.key));
 const q3=secondary.type==="p"?PERSONALITY_PROMPTS[secondary.key]:VALUE_PROMPTS[secondary.key];
 $("#localDiscussionPrompts").innerHTML="<ol><li>"+PERSONALITY_PROMPTS[p.key]+"</li><li>"+VALUE_PROMPTS[v.key]+"</li><li>"+q3+"</li></ol>";
}
function llmPrompt(t){
 return "You are facilitating a team-development conversation using anonymous aggregate data about personality preferences and moral priorities.\n\n"+
 "Important constraints:\n"+
 "- Do not infer any individual's profile, identity, politics, religion, ideology, mental health, competence, or motives.\n"+
 "- Do not rank traits or moral foundations as better/worse, mature/immature, or compatible/incompatible.\n"+
 "- Do not infer factions or subgroups from aggregate statistics.\n"+
 "- Treat means and SDs as descriptive self-report signals, not population-normed scores.\n"+
 "- Personality uses Mini-IPIP-derived Big Five scores; Emotional Stability is the reverse of Neuroticism.\n"+
 "- Moral-priority items are original, research-informed adaptations mapped to the six MFQ-2 foundations; they are NOT the validated MFQ-2 and must not be compared to MFQ-2 norms.\n"+
 "- Focus on work-design implications, communication practices, decision processes, and low-risk team experiments.\n\n"+
 "Team size: "+t.n+"\n\nPersonality aggregate (1–5):\n"+
 PERSONALITY.map(d=>"- "+d[1]+": mean "+t.personality.mean[d[0]].toFixed(2)+", respondent SD "+t.personality.sd[d[0]].toFixed(2)).join("\n")+
 "\n\nMoral-priority aggregate (1–5):\n"+
 VALUES.map(d=>"- "+d[1]+": mean "+t.values.mean[d[0]].toFixed(2)+", respondent SD "+t.values.sd[d[0]].toFixed(2)).join("\n")+
 "\n\nReturn:\n1. A short neutral summary of the team's diversity profile.\n2. The 3–4 dimensions where within-team variation is most operationally relevant.\n3. For each, explain two plausible ways that difference could be complementary and two ways it could create friction.\n4. Four concrete facilitation questions.\n5. Three low-risk 2–4 week team experiments, each with a success signal.\n6. A short section on what cannot be inferred from these data.\nKeep the analysis non-political and non-diagnostic.";
}
function csv(t){
 const r=[["Domain","Dimension","Mean","Respondent SD","Variation"]];
 PERSONALITY.forEach(d=>r.push(["Personality",d[1],t.personality.mean[d[0]].toFixed(2),t.personality.sd[d[0]].toFixed(2),dispersionLabel(t.personality.sd[d[0]])[1]]));
 VALUES.forEach(d=>r.push(["Moral priority",d[1],t.values.mean[d[0]].toFixed(2),t.values.sd[d[0]].toFixed(2),dispersionLabel(t.values.sd[d[0]])[1]]));
 r.push(["Metadata","Response count",t.n,"",""]);
 return r.map(a=>a.map(v=>{v=String(v);return /[",\n]/.test(v)?'"'+v.replaceAll('"','""')+'"':v;}).join(",")).join("\n");
}

$("#beginDifferencesBtn").onclick=()=>{$("#differencesStart").classList.add("hidden");$("#differencesForm").classList.remove("hidden");$("#differencesForm").scrollIntoView({behavior:"smooth"});};
$("#differencesForm").addEventListener("change",updateProgress);
$("#differencesForm").addEventListener("submit",e=>{e.preventDefault();const a=getAnswers();if(Object.keys(a).length!==itemMeta.length){$("#differencesError").textContent="Please answer all 38 statements before viewing your profile.";const m=itemMeta.find(x=>!a[x.key]);document.querySelector('[data-key="'+m.key+'"]')?.scrollIntoView({behavior:"smooth",block:"center"});return;}$("#differencesError").textContent="";individual=scoreIndividual(a);renderBars($("#individualPersonalityBars"),PERSONALITY,individual.personality);renderBars($("#individualValuesBars"),VALUES,individual.values);$("#differencesIndividualResults").classList.remove("hidden");$("#differencesIndividualResults").scrollIntoView({behavior:"smooth"});});
function clearIndividual(){$("#differencesForm").reset();individual=null;$("#differencesIndividualResults").classList.add("hidden");$("#differencesError").textContent="";$("#differencesIndividualStatus").textContent="";updateProgress();}
$("#clearDifferencesBtn").onclick=clearIndividual;$("#retakeDifferencesBtn").onclick=clearIndividual;
$("#exportDifferencesBtn").onclick=()=>{if(!individual)return;download("team-differences-profile.json",JSON.stringify({schema:"team-differences-summary-response",version:VERSION,scores:individual},null,2),"application/json");$("#differencesIndividualStatus").textContent="Anonymous scale summary exported. It contains no identifier, timestamp, or raw item answers.";};

$("#differenceFiles").addEventListener("change",async e=>{const fs=[...(e.target.files||[])],ok=[],bad=[];team=null;$("#differencesTeamResults").classList.add("hidden");$("#differencePrivacyGate").classList.add("hidden");for(const f of fs){try{const x=JSON.parse(await f.text());validFile(x)?ok.push(x):bad.push(f.name);}catch{bad.push(f.name);}}$("#differenceFileStatus").textContent=ok.length+" valid profile"+(ok.length===1?"":"s")+" loaded"+(bad.length?"; "+bad.length+" invalid file(s) ignored":"")+".";if(ok.length<MIN_TEAM_N){$("#differencePrivacyGateText").textContent="This module requires at least "+MIN_TEAM_N+" valid profiles before displaying team-level personality or moral-value statistics. "+ok.length+" currently loaded.";$("#differencePrivacyGate").classList.remove("hidden");return;}team=aggregate(ok);$("#differenceResponseCount").textContent=team.n;renderBars($("#teamPersonalityBars"),PERSONALITY,team.personality.mean,team.personality.sd);renderBars($("#teamValuesBars"),VALUES,team.values.mean,team.values.sd);const p=highest(PERSONALITY,team.personality.sd),v=highest(VALUES,team.values.sd);$("#topPersonalityDifference").textContent=p.name+" · SD "+p.sd.toFixed(2);$("#topValueDifference").textContent=v.name+" · SD "+v.sd.toFixed(2);renderPrompts(team);$("#differencesTeamResults").classList.remove("hidden");$("#differencesTeamResults").scrollIntoView({behavior:"smooth"});});
$("#copyDifferencesPromptBtn").onclick=async()=>{if(team){await copyText(llmPrompt(team));$("#differencesTeamStatus").textContent="Aggregate-only LLM prompt copied. It contains no individual profiles.";}};
$("#exportDifferencesCsvBtn").onclick=()=>{if(team){download("team-differences-aggregate.csv",csv(team),"text/csv;charset=utf-8");$("#differencesTeamStatus").textContent="Aggregate summary exported as CSV.";}};
$("#clearDifferenceFilesBtn").onclick=()=>{team=null;$("#differenceFiles").value="";$("#differencesTeamResults").classList.add("hidden");$("#differencePrivacyGate").classList.add("hidden");$("#differenceFileStatus").textContent="Imported profiles cleared from page memory.";$("#differencesTeamStatus").textContent="";};

renderQuestions();updateProgress();
})();