
let DB = JSON.parse(localStorage.getItem("botanic_proper_v6") || JSON.stringify(window.BOTANIC_DATA));
const $ = id => document.getElementById(id);
const money = n => n === null || n === undefined ? "TBC" : "$" + Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
function save(){localStorage.setItem("botanic_proper_v6", JSON.stringify(DB));}
function avgReadiness(){return Math.round(DB.workstreams.reduce((a,w)=>a+w.progress,0)/DB.workstreams.length);}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));$(b.dataset.page).classList.add("active");document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active", n===b));$("pageTitle").textContent=b.textContent;});
$("mode").onchange=e=>{document.body.className=e.target.value;localStorage.setItem("botanic_theme",e.target.value)};
function table(headers, rows){return "<thead><tr>"+headers.map(h=>`<th>${h}</th>`).join("")+"</tr></thead><tbody>"+rows.map(r=>"<tr>"+r.map(c=>`<td>${c??""}</td>`).join("")+"</tr>").join("")+"</tbody>"}
function render(){
  document.body.className=localStorage.getItem("botanic_theme")||"botanic"; $("mode").value=document.body.className;
  let r=avgReadiness(); $("readinessRing").style.setProperty("--p",r+"%"); $("readinessPct").textContent=r+"%";
  $("cashRemaining").textContent=money(DB.workingCashSummary.cashBalanceRemaining); $("remainingProcurement").textContent=money(DB.workingCashSummary.remainingProcurement); $("projectSavings").textContent=money(DB.workingCashSummary.savingsCostAvoidance);
  $("timelineTop").innerHTML=DB.timeline.map((t,i)=>`<div class="week ${i===0?'current':''}" title="${t.tasks.join(', ')}"><div class="dot"></div><b>${t.month}</b><small>${t.week}</small><small>${t.focus}</small></div>`).join("");
  $("progressBars").innerHTML=DB.workstreams.map(w=>`<div class="progressRow"><div>${w.name}</div><div class="muted">${w.progress}% · ${w.target}</div><div class="bar"><div style="width:${w.progress}%"></div></div></div>`).join("");
  $("criticalPath").innerHTML=DB.criticalPath.map(x=>`<li>${x}</li>`).join("");
  let blockers=[]; DB.workstreams.forEach(w=>w.blockers.forEach(b=>blockers.push(`${w.name}: ${b}`))); $("blockers").innerHTML=blockers.slice(0,8).map(x=>`<li>⚠️ ${x}</li>`).join("");
  $("taskCards").innerHTML=DB.workstreams.map(w=>`<div class="taskBlock"><h4>${w.name}</h4><ul>${w.priority.slice(0,3).map(x=>`<li>${x}</li>`).join("")}</ul><details><summary>Coming up: ${w.upcoming.slice(0,2).join(" · ")}</summary><ul>${w.upcoming.map(x=>`<li>${x}</li>`).join("")}</ul></details></div>`).join("");
  $("purchaseList").innerHTML=DB.procurement.filter(p=>["Urgent","High","Medium"].includes(p.priority)).slice(0,10).map(p=>`<div class="purchase"><div>${p.item}</div><div class="muted">${p.supplier} · ${p.qty}</div><div class="price">${money(p.cost)}</div><div class="status">${p.priority}</div></div>`).join("");
  $("roadmapCards").innerHTML=DB.workstreams.map(w=>`<details class="roadCard" open><summary>${w.name} <span class="pill">${w.progress}%</span> <span class="pill">Target: ${w.target}</span></summary><p><b>Milestone:</b> ${w.milestone}</p><h4>Priority</h4><ul>${w.priority.map(x=>`<li>${x}</li>`).join("")}</ul><h4>Upcoming</h4><ul>${w.upcoming.map(x=>`<li>${x}</li>`).join("")}</ul><h4>Blockers</h4><ul>${w.blockers.map(x=>`<li>${x}</li>`).join("")}</ul></details>`).join("");
  $("fullTasks").innerHTML=DB.workstreams.map(w=>`<details open><summary>${w.name}</summary><ul>${w.priority.map(x=>`<li><input type="checkbox"> ${x}</li>`).join("")}</ul><p class="muted">Before marking complete: record user, date, time, supplier/cost/specs if relevant.</p></details>`).join("");
  $("procurementTable").innerHTML=table(["Item","Supplier","Qty","Spec","Cost","Priority","Status","Workstream"], DB.procurement.map(p=>[p.item,p.supplier,p.qty,p.spec,money(p.cost),p.priority,p.status,p.workstream]));
  let s=DB.workingCashSummary;
  $("cashSummary").innerHTML=`<div class="metrics"><div><span>Total Cash In</span><b>${money(s.cashInTotal)}</b></div><div><span>Expenses Recorded</span><b>${money(s.expensesRecorded)}</b></div><div><span>Cash Remaining</span><b>${money(s.cashBalanceRemaining)}</b></div><div><span>Remaining Procurement</span><b>${money(s.remainingProcurement)}</b></div><div><span>Total Installed Cost</span><b>${money(s.installedCost)}</b></div><div><span>Project Savings</span><b>${money(s.savingsCostAvoidance)}</b></div></div><p class="muted">Materials ${money(s.materialsCostPerMetre)}/m · Labour ${money(s.labourCostPerMetre)}/m · Installed ${money(s.installedCostPerMetre)}/m · Duration ${s.expectedDuration}</p>`;
  $("preExistingTable").innerHTML=table(["Item","Supplier","Qty","Value"], DB.preExistingMaterials.map(p=>[p.item,p.supplier,p.qty,money(p.value)]));
  $("purchasesMadeTable").innerHTML=table(["Item","Supplier","Delivery","Qty","Cost"], DB.purchasesMade.map(p=>[p.item,p.supplier,p.delivery,p.qty,money(p.cost)]));
  $("comparisonTable").innerHTML=table(["Item","Original","Current","Difference","Note"], DB.comparisons.map(c=>[c.item,c.original,c.current,money(c.difference),c.note||""]));
  $("completionTimeline").innerHTML=DB.completionTimeline.map(e=>`<details><summary>${e.title} <span class="muted">· ${e.date} · ${e.time} · ${e.user}</span></summary><p><b>Type:</b> ${e.type}</p><p>${e.details}</p></details>`).join("");
  renderArchive();
}
function renderArchive(){let a=JSON.parse(localStorage.getItem("botanic_notes_archive")||"{}"); $("notesArchive").innerHTML=Object.keys(a).sort().reverse().map(k=>`<details><summary>${k} · ${a[k].length} notes</summary><ul>${a[k].map(n=>`<li>${n}</li>`).join("")}</ul></details>`).join("") || "<p class='muted'>No archived notes yet.</p>";}
$("archiveBtn").onclick=()=>{let v=$("noteInput").value.trim(); if(!v)return; let a=JSON.parse(localStorage.getItem("botanic_notes_archive")||"{}"); let k=new Date().toISOString().slice(0,10); (a[k]=a[k]||[]).push(v); localStorage.setItem("botanic_notes_archive",JSON.stringify(a)); $("noteInput").value=""; renderArchive();}
$("taskBtn").onclick=()=>{let v=$("noteInput").value.trim(); if(!v)return; DB.workstreams[0].priority.unshift(v+" (from Brain Dump)"); $("noteInput").value=""; save(); render();}
$("voiceBtn").onclick=()=>alert("Voice transcription placeholder for hosted/API version.");
$("exportBtn").onclick=()=>{let a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(DB,null,2)],{type:"application/json"})); a.download="botanic-command-centre-proper-v6-backup.json"; a.click();}
render();
