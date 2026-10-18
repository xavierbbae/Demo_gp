const companies = Array.isArray(window.COMPANIES) ? window.COMPANIES : [];
const STORAGE_KEY = 'parfait_dashboard_internal_v2';

const sectionNames = {
  A:'Agriculture', B:'Industries extractives', C:'Industrie', D:'Énergie', E:'Eau & déchets', F:'Construction',
  G:'Commerce & automobile', H:'Transport', I:'Hébergement & restauration', J:'Information & communication',
  K:'Finance & assurance', L:'Immobilier', M:'Services & holdings', N:'Services administratifs', P:'Enseignement',
  Q:'Santé & action sociale', R:'Arts & loisirs', S:'Autres services'
};
const employeeRanges = {NN:'Non renseigné','00':'0 salarié','01':'1–2','02':'3–5','03':'6–9','11':'10–19','12':'20–49','21':'50–99','22':'100–199','31':'200–249','32':'250–499','41':'500–999','42':'1 000–1 999','51':'2 000–4 999','52':'5 000–9 999','53':'10 000+'};
const employeeMid = {NN:0,'00':0,'01':2,'02':4,'03':8,'11':15,'12':35,'21':75,'22':150,'31':225,'32':375,'41':750,'42':1500,'51':3500,'52':7500,'53':12000};
const months = ['Nov. 25','Déc. 25','Jan. 26','Fév. 26','Mars 26','Avr. 26','Mai 26','Juin 26','Juil. 26','Août 26','Sept. 26','Oct. 26'];

let internal = loadInternal();
let currentCompany = null;

function loadInternal(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{}}catch{return{}} }
function saveInternal(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(internal)); }
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function fmtMoney(v, compact=true){const x=n(v);if(x===null)return 'N/D';const abs=Math.abs(x);const sign=x<0?'-':'';if(compact){if(abs>=1e9)return sign+(abs/1e9).toLocaleString('fr-FR',{maximumFractionDigits:1})+' Md€';if(abs>=1e6)return sign+(abs/1e6).toLocaleString('fr-FR',{maximumFractionDigits:1})+' M€';if(abs>=1e3)return sign+(abs/1e3).toLocaleString('fr-FR',{maximumFractionDigits:0})+' k€'}return x.toLocaleString('fr-FR')+' €'}
function fmtDate(s){if(!s)return 'N/D';const d=new Date(s+'T00:00:00');return d.toLocaleDateString('fr-FR')}
function sector(c){return sectionNames[c.section_activite_principale]||'Autres / non classé'}
function employeeLabel(c){return employeeRanges[c.tranche_effectif_salarie]||c.tranche_effectif_salarie||'N/D'}
function managerLabel(c){if(c.dirigeant_robert&&c.dirigeant_kevin)return 'Robert & Kévin Parfait';if(c.dirigeant_robert)return 'Robert Parfait';if(c.dirigeant_kevin)return 'Kévin Parfait';return '—'}
function getInternal(siren){return internal[siren]||{}}
function seeded(s, mod=1000){return [...String(s)].reduce((a,ch,i)=>a+(ch.charCodeAt(0)*(i+3)),17)%mod}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

function annualRevenueBase(c){
  const pub=n(c.ca_public);
  if(pub && pub>0) return pub;
  const emp=employeeMid[c.tranche_effectif_salarie]||0;
  const sec=c.section_activite_principale;
  const seed=seeded(c.siren,1000);
  const categoryBase=c.categorie_entreprise==='ETI'?28000000:c.categorie_entreprise==='PME'?6500000:2200000;
  const perEmployee={G:380000,I:180000,L:260000,D:520000,M:230000,N:190000,K:420000,C:310000,F:220000}[sec]||240000;
  const empBase=emp>0?emp*perEmployee:0;
  let base=Math.max(categoryBase,empBase);
  if(sec==='L' && emp===0) base=Math.max(base,1800000+(seed%7)*900000);
  if(sec==='D') base=Math.max(base,2400000+(seed%9)*1100000);
  if(sec==='M' && c.activite_principale==='70.10Z') base*=1.7;
  return Math.round(base*(0.72+(seed%47)/100));
}

function simulatedFinance(c){
  const saved=getInternal(c.siren); if(saved.simulatedFinance) return saved.simulatedFinance;
  const annual=annualRevenueBase(c);
  const seed=seeded(c.siren,10000);
  const trend=((seed%170)-65)/1000; // -6.5% à +10.4%
  const seasonalityBySec={G:[.88,.98,.92,.91,1.00,1.03,1.07,1.10,1.02,.86,1.05,1.15],I:[.93,1.08,.88,.91,.98,1.01,1.04,1.07,1.10,1.16,.98,.86],L:[.96,.98,.99,1.00,1.01,1.02,1.03,1.01,.98,.96,1.02,1.04],D:[1.02,1.06,1.03,1.02,1.00,.99,.96,.94,.95,.98,1.01,1.04],M:[.95,1.01,.98,.99,1.03,1.00,1.02,1.01,.97,.94,1.04,1.06]};
  const season=seasonalityBySec[c.section_activite_principale]||[.95,1.03,.97,.98,1.01,1.02,1.04,1.05,1.01,.93,1.00,1.01];
  const sum=season.reduce((a,b)=>a+b,0);
  const marginBase={G:.045,I:.065,L:.16,D:.12,M:.11,N:.07,K:.13,C:.08,F:.075}[c.section_activite_principale]||.075;
  const monthly=season.map((w,i)=>{
    const noise=1+(((seed>>(i%8))%11)-5)/100;
    const progression=1+trend*((i-5.5)/11);
    const revenue=Math.round((annual*w/sum)*noise*progression);
    const margin=clamp(marginBase+(((seed+i*31)%45)-20)/1000,-.08,.28);
    const result=Math.round(revenue*margin);
    const prior=Math.round(revenue/(1+trend || 1));
    return {month:months[i],revenue,result,prior};
  });
  const ytd=monthly.slice(2).reduce((s,x)=>s+x.revenue,0);
  const priorYtd=monthly.slice(2).reduce((s,x)=>s+x.prior,0);
  const objective=Math.round(ytd*(1.015+((seed%40)/1000)));
  const finance={annual,monthly,ytd,priorYtd,objective,trend:(ytd/priorYtd-1)*100};
  internal[c.siren]={...saved,simulatedFinance:finance}; saveInternal(); return finance;
}

function demoMetrics(c){
  const saved=getInternal(c.siren); if(saved.demoMetrics)return saved.demoMetrics;
  const f=simulatedFinance(c); const seed=seeded(c.siren,1000);
  const caPerf=Math.round(f.ytd/f.objective*100); const margin=88+(seed*11)%24; const staffing=employeeMid[c.tranche_effectif_salarie]||10+(seed*13)%190;
  const score=Math.round(caPerf*.55+margin*.25+Math.min(110,90+(seed%25))*.20);
  const dm={caPerf,margin,staffing,score}; internal[c.siren]={...saved,demoMetrics:dm}; saveInternal(); return dm;
}
function statusFromScore(score){return score>=100?'green':score>=92?'orange':'red'}

function setupNav(){
  document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.view)));
  document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.go)));
}
function showView(name){
  const titles={overview:['PILOTAGE GROUPE','Vue d\'ensemble'],companies:['RÉFÉRENTIEL','Entreprises'],performance:['ANALYSE FINANCIÈRE','Performance'],map:['STRUCTURE','Cartographie'],connections:['INTÉGRATIONS','Connexions comptables']};
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active')); const target=document.getElementById(name+'View'); if(target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===name));
  document.getElementById('pageEyebrow').textContent=titles[name][0]; document.getElementById('pageTitle').textContent=titles[name][1];
  if(name==='companies')renderCompanies(); if(name==='performance')renderPerformance(); if(name==='map')renderMap(); if(name==='connections')renderConnections();
}

function groupTotals(){
  const active=companies.filter(c=>c.etat_administratif==='A');
  const ytd=active.reduce((s,c)=>s+simulatedFinance(c).ytd,0);
  const prior=active.reduce((s,c)=>s+simulatedFinance(c).priorYtd,0);
  const result=active.reduce((s,c)=>s+simulatedFinance(c).monthly.slice(2).reduce((a,m)=>a+m.result,0),0);
  const objective=active.reduce((s,c)=>s+simulatedFinance(c).objective,0);
  return {active,ytd,prior,result,objective,growth:(ytd/prior-1)*100};
}

function sparkline(values,w=520,h=150){
  const min=Math.min(...values), max=Math.max(...values), range=max-min||1;
  const pts=values.map((v,i)=>`${(i/(values.length-1))*w},${h-((v-min)/range)*(h-18)-9}`).join(' ');
  return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="3" vector-effect="non-scaling-stroke"/><polyline points="0,${h} ${pts} ${w},${h}" fill="currentColor" opacity=".06" stroke="none"/></svg>`;
}

function renderOverview(){
  const active=companies.filter(c=>c.etat_administratif==='A').length; const gt=groupTotals();
  const cards=[['CA simulé 2026 à date',fmtMoney(gt.ytd),`${gt.growth>=0?'+':''}${gt.growth.toFixed(1)} % vs N-1`],['Résultat simulé',fmtMoney(gt.result),'Cumul janvier → octobre'],['Objectif groupe',fmtMoney(gt.objective),`${Math.round(gt.ytd/gt.objective*100)} % atteint`],['Sociétés actives',active,`${companies.length} sociétés dans le référentiel`]];
  document.getElementById('overviewKpis').innerHTML=cards.map(x=>`<div class="kpi-card"><div class="kpi-label">${x[0]}</div><div class="kpi-value">${x[1]}</div><div class="kpi-note">${x[2]}</div></div>`).join('');

  const monthly=months.map((month,i)=>({month,revenue:gt.active.reduce((s,c)=>s+simulatedFinance(c).monthly[i].revenue,0),prior:gt.active.reduce((s,c)=>s+simulatedFinance(c).monthly[i].prior,0)}));
  document.getElementById('groupTrend').innerHTML=`<div class="trend-summary"><div><span>CA octobre simulé</span><strong>${fmtMoney(monthly[11].revenue)}</strong></div><div><span>vs octobre N-1</span><strong class="${monthly[11].revenue>=monthly[11].prior?'positive':'negative'}">${((monthly[11].revenue/monthly[11].prior-1)*100).toFixed(1)} %</strong></div></div>${sparkline(monthly.map(x=>x.revenue))}<div class="month-axis">${months.map(m=>`<span>${m.replace(' 26','')}</span>`).join('')}</div>`;

  document.getElementById('financialTop').innerHTML=companies.filter(c=>c.etat_administratif==='A').map(c=>({c,f:simulatedFinance(c)})).sort((a,b)=>b.f.ytd-a.f.ytd).slice(0,8).map(({c,f})=>`<tr data-siren="${c.siren}"><td><div class="company-name">${esc(c.nom_complet)}</div><div class="company-sub">${esc(sector(c))}</div></td><td class="money">${fmtMoney(f.ytd)}</td><td class="money ${f.trend>=0?'positive':'negative'}">${f.trend>=0?'+':''}${f.trend.toFixed(1)} %</td><td class="money">${fmtMoney(f.monthly.slice(2).reduce((s,m)=>s+m.result,0))}</td></tr>`).join('');
  document.querySelectorAll('#financialTop tr').forEach(r=>r.addEventListener('click',()=>openCompany(r.dataset.siren)));

  const sec={};companies.forEach(c=>sec[sector(c)]=(sec[sector(c)]||0)+1); const sorted=Object.entries(sec).sort((a,b)=>b[1]-a[1]).slice(0,7), max=sorted[0]?.[1]||1;
  document.getElementById('sectorBars').innerHTML=sorted.map(([s,v])=>`<div class="sector-row"><span>${esc(s)}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><b>${v}</b></div>`).join('');

  const connected=Number(localStorage.getItem('parfait_connected_tools')||0);
  document.getElementById('automationCard').innerHTML=`<div class="automation-icon">↻</div><div><b>${connected?connected+' connecteur'+(connected>1?'s':'')+' activé'+(connected>1?'s':''):'Connecter les outils comptables'}</b><p>${connected?'Dernière synchronisation simulée : il y a 8 min.':'Automatisez le CA, le résultat, la trésorerie et les KPI au jour le jour.'}</p></div><button class="btn primary" onclick="showView('connections')">${connected?'Gérer':'Configurer'}</button>`;
}

function setupCompanyFilters(){
  const select=document.getElementById('sectorFilter'); [...new Set(companies.map(sector))].sort().forEach(s=>select.insertAdjacentHTML('beforeend',`<option value="${esc(s)}">${esc(s)}</option>`));
  ['companySearch','statusFilter','sectorFilter','managerFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='companySearch'?'input':'change',renderCompanies));
}
function renderCompanies(){
  const q=document.getElementById('companySearch').value.trim().toLowerCase(),st=document.getElementById('statusFilter').value,sec=document.getElementById('sectorFilter').value,mgr=document.getElementById('managerFilter').value;
  let rows=companies.filter(c=>{ const hay=[c.nom_complet,c.siren,c.siret_siege,c.ville,c.adresse,c.activite_principale].join(' ').toLowerCase(); const okMgr=mgr==='all'||(mgr==='robert'&&c.dirigeant_robert)||(mgr==='kevin'&&c.dirigeant_kevin)||(mgr==='both'&&c.dirigeant_robert&&c.dirigeant_kevin); return (!q||hay.includes(q))&&(st==='all'||c.etat_administratif===st)&&(sec==='all'||sector(c)===sec)&&okMgr; });
  document.getElementById('companyCount').textContent=`${rows.length} / ${companies.length} sociétés`;
  document.getElementById('companiesTable').innerHTML=rows.length?rows.map(c=>{const f=simulatedFinance(c); return `<tr data-siren="${c.siren}"><td><div class="company-name">${esc(c.nom_complet)}</div><div class="company-sub">${esc(managerLabel(c))}</div></td><td>${c.siren}</td><td><div>${esc(sector(c))}</div><div class="company-sub">${esc(c.activite_principale||'')}</div></td><td>${esc(c.ville||'N/D')}</td><td>${esc(employeeLabel(c))}</td><td class="money">${fmtMoney(f.ytd)}</td><td class="${f.trend>=0?'positive':'negative'}">${f.trend>=0?'+':''}${f.trend.toFixed(1)} %</td><td><span class="badge ${c.etat_administratif==='A'?'active':'closed'}">${c.etat_administratif==='A'?'Active':'Fermée'}</span></td><td>›</td></tr>`}).join(''):`<tr><td colspan="9" class="empty">Aucune société ne correspond aux filtres.</td></tr>`;
  document.querySelectorAll('#companiesTable tr[data-siren]').forEach(r=>r.addEventListener('click',()=>openCompany(r.dataset.siren)));
}

function renderPerformance(){
  const filter=document.getElementById('performanceFilter').value; const active=companies.filter(c=>c.etat_administratif==='A');
  let rows=active.map(c=>({c,m:demoMetrics(c),f:simulatedFinance(c)})).filter(x=>filter==='all'||statusFromScore(x.m.score)===filter).sort((a,b)=>a.m.score-b.m.score);
  const statuses=active.map(c=>statusFromScore(demoMetrics(c).score)), avg=Math.round(active.reduce((s,c)=>s+demoMetrics(c).score,0)/(active.length||1));
  const gt=groupTotals(); const cards=[['CA YTD simulé',fmtMoney(gt.ytd),`${gt.growth>=0?'+':''}${gt.growth.toFixed(1)} % vs N-1`],['Résultat YTD',fmtMoney(gt.result),'Simulation consolidée'],['Score moyen',avg+' / 100','Performance interne'],['En alerte',statuses.filter(s=>s==='red').length,'Score < 92']];
  document.getElementById('performanceKpis').innerHTML=cards.map(x=>`<div class="kpi-card"><div class="kpi-label">${x[0]}</div><div class="kpi-value">${x[1]}</div><div class="kpi-note">${x[2]}</div></div>`).join('');
  document.getElementById('performanceTable').innerHTML=rows.map(({c,m,f})=>{const st=statusFromScore(m.score);return `<tr data-siren="${c.siren}"><td><div class="company-name">${esc(c.nom_complet)}</div><div class="company-sub">${c.siren}</div></td><td>${esc(sector(c))}</td><td class="money">${fmtMoney(f.ytd)}</td><td class="${f.trend>=0?'positive':'negative'}">${f.trend>=0?'+':''}${f.trend.toFixed(1)} %</td><td class="money">${fmtMoney(f.monthly.slice(2).reduce((s,x)=>s+x.result,0))}</td><td><div class="score"><b>${m.score}</b><div class="score-bar"><div class="score-fill ${st}" style="width:${Math.min(100,m.score)}%"></div></div></div></td><td><span class="badge ${st}">${st==='green'?'Objectif atteint':st==='orange'?'À surveiller':'En alerte'}</span></td></tr>`}).join('');
  document.querySelectorAll('#performanceTable tr[data-siren]').forEach(r=>r.addEventListener('click',()=>openCompany(r.dataset.siren)));
}

function renderMap(){
  const groups={}; companies.filter(c=>c.etat_administratif==='A').forEach(c=>{const s=sector(c); (groups[s]||(groups[s]=[])).push(c)});
  document.getElementById('groupMap').innerHTML=Object.entries(groups).sort((a,b)=>b[1].length-a[1].length).map(([s,list])=>`<div class="group-node"><h4>${esc(s)}</h4><p>${list.length} société${list.length>1?'s':''}</p><div class="group-companies">${list.slice(0,9).map(c=>`<button class="company-pill" data-siren="${c.siren}">${esc(c.nom_complet)}</button>`).join('')}${list.length>9?`<span class="company-pill">+${list.length-9}</span>`:''}</div></div>`).join('');
  document.querySelectorAll('.company-pill[data-siren]').forEach(b=>b.addEventListener('click',()=>openCompany(b.dataset.siren)));
}

const accountingTools=[
  {name:'Sage',desc:'Comptabilité, écritures, balances et journaux',logo:'S',status:'Disponible'},
  {name:'Cegid',desc:'Finance, comptabilité et gestion multi-entités',logo:'C',status:'Disponible'},
  {name:'Pennylane',desc:'Facturation, banque et comptabilité',logo:'P',status:'Disponible'},
  {name:'EBP',desc:'Comptabilité et gestion pour PME',logo:'E',status:'À configurer'},
  {name:'SAP / ERP',desc:'Connecteur générique ERP et finance',logo:'SA',status:'Sur mesure'},
  {name:'Oracle / NetSuite',desc:'ERP, finance et consolidation',logo:'O',status:'Sur mesure'},
  {name:'Fichier / SFTP',desc:'Import automatique CSV, Excel ou dépôt SFTP',logo:'⇅',status:'Disponible'},
  {name:'API personnalisée',desc:'Connexion à un logiciel métier interne',logo:'API',status:'Sur mesure'}
];
function renderConnections(){
  const state=JSON.parse(localStorage.getItem('parfait_connection_state')||'{}');
  document.getElementById('connectionsGrid').innerHTML=accountingTools.map((t,i)=>{const on=!!state[i];return `<article class="connection-card"><div class="connection-logo">${t.logo}</div><div class="connection-content"><div class="connection-title"><h3>${t.name}</h3><span class="badge ${on?'green':'neutral'}">${on?'Connecté':t.status}</span></div><p>${t.desc}</p><div class="connection-meta"><span>${on?'Synchronisation toutes les heures':'Données disponibles selon API / export'}</span>${on?'<span>Dernière synchro · 09:54</span>':''}</div></div><button class="btn ${on?'ghost':'primary'} connect-btn" data-index="${i}">${on?'Déconnecter':'Connecter'}</button></article>`}).join('');
  document.querySelectorAll('.connect-btn').forEach(btn=>btn.addEventListener('click',()=>{const s=JSON.parse(localStorage.getItem('parfait_connection_state')||'{}'); const i=btn.dataset.index; s[i]=!s[i]; localStorage.setItem('parfait_connection_state',JSON.stringify(s)); localStorage.setItem('parfait_connected_tools',Object.values(s).filter(Boolean).length); renderConnections(); renderOverview();}));
}

function openCompany(siren){
  const c=companies.find(x=>x.siren===siren); if(!c)return; currentCompany=c; const int=getInternal(siren), f=simulatedFinance(c), dm=demoMetrics(c);
  const publicCA=n(c.ca_public)>0?fmtMoney(c.ca_public):'N/D'; const resultPublic=n(c.resultat_net_public)!==null?fmtMoney(c.resultat_net_public):'N/D';
  document.getElementById('drawerContent').innerHTML=`
    <div class="drawer-header"><p class="eyebrow">${esc(sector(c))}</p><h2>${esc(c.nom_complet)}</h2><p class="muted">SIREN ${c.siren} · ${esc(managerLabel(c))}</p></div>
    <div class="drawer-body">
      <div class="section-title">Données légales</div>
      <div class="info-grid">
        <div class="info-box"><small>SIRET siège</small><b>${esc(c.siret_siege||'N/D')}</b><div class="data-source">Source publique</div></div>
        <div class="info-box"><small>Date de création</small><b>${fmtDate(c.date_creation)}</b><div class="data-source">Source publique</div></div>
        <div class="info-box"><small>Activité</small><b>${esc(c.activite_principale||'N/D')} · ${esc(sector(c))}</b><div class="data-source">Source publique</div></div>
        <div class="info-box"><small>Adresse</small><b>${esc(c.adresse||'N/D')}</b><div class="data-source">Source publique</div></div>
        <div class="info-box"><small>Effectif officiel</small><b>${esc(employeeLabel(c))}</b><div class="data-source">${c.annee_tranche_effectif_salarie?'Année '+c.annee_tranche_effectif_salarie:'Source publique'}</div></div>
        <div class="info-box"><small>Catégorie</small><b>${esc(c.categorie_entreprise||'N/D')}</b><div class="data-source">Source publique</div></div>
      </div>

      <div class="section-title">Finance — données publiques disponibles</div>
      <div class="finance-grid"><div class="finance-card"><small>CA public</small><strong>${publicCA}</strong><span>${c.annee_finances||'—'}</span></div><div class="finance-card"><small>Résultat public</small><strong>${resultPublic}</strong><span>${c.annee_finances||'—'}</span></div><div class="finance-card"><small>Base de simulation</small><strong>${fmtMoney(f.annual)}</strong><span>${n(c.ca_public)>0?'Ancrée sur CA public':'Estimée pour démo'}</span></div></div>

      <div class="section-title">Suivi mensuel simulé</div>
      <div class="company-chart">${sparkline(f.monthly.map(x=>x.revenue),600,170)}<div class="month-axis">${months.map(m=>`<span>${m.split('.')[0]}</span>`).join('')}</div></div>
      <div class="finance-grid"><div class="finance-card"><small>CA 2026 à date</small><strong>${fmtMoney(f.ytd)}</strong></div><div class="finance-card"><small>Évolution N-1</small><strong class="${f.trend>=0?'positive':'negative'}">${f.trend>=0?'+':''}${f.trend.toFixed(1)} %</strong></div><div class="finance-card"><small>Objectif</small><strong>${fmtMoney(f.objective)}</strong></div></div>
      <div class="table-wrap monthly"><table><thead><tr><th>Mois</th><th>CA simulé</th><th>CA N-1 simulé</th><th>Résultat simulé</th></tr></thead><tbody>${f.monthly.map(m=>`<tr><td>${m.month}</td><td class="money">${fmtMoney(m.revenue)}</td><td class="money">${fmtMoney(m.prior)}</td><td class="money ${m.result>=0?'positive':'negative'}">${fmtMoney(m.result)}</td></tr>`).join('')}</tbody></table></div>

      <div class="section-title">Données internes modifiables</div>
      <form class="edit-form" id="internalForm">
        <label>Effectif actuel<input id="internalEmployees" type="number" value="${esc(int.effectif_interne??'')}" placeholder="Ex. 47"></label>
        <label>CA interne annuel (€)<input id="internalRevenue" type="number" value="${esc(int.ca_interne??'')}" placeholder="Ex. 12500000"></label>
        <label>Objectif CA (€)<input id="internalTarget" type="number" value="${esc(int.objectif_ca??'')}" placeholder="Ex. 13000000"></label>
        <label>Catégorie groupe<input id="internalCategory" value="${esc(int.categorie_groupe??'')}" placeholder="Ex. Automobile"></label>
        <label class="full">Commentaire<textarea id="internalComment" rows="3" placeholder="Commentaire de gestion…">${esc(int.commentaire??'')}</textarea></label>
        <div class="form-actions full"><button class="btn primary" type="submit">Enregistrer</button></div>
      </form>

      <div class="section-title">KPI internes</div><div class="kpi-list" id="companyKpiList"></div><button class="btn ghost" id="addKpiBtn">+ Ajouter un KPI</button>
    </div>`;
  renderCompanyKpis(c.siren);
  document.getElementById('internalForm').addEventListener('submit',e=>{e.preventDefault();const old=getInternal(c.siren);internal[c.siren]={...old,effectif_interne:document.getElementById('internalEmployees').value,ca_interne:document.getElementById('internalRevenue').value,objectif_ca:document.getElementById('internalTarget').value,categorie_groupe:document.getElementById('internalCategory').value,commentaire:document.getElementById('internalComment').value};saveInternal();alert('Données internes enregistrées localement.');});
  document.getElementById('addKpiBtn').addEventListener('click',()=>openKpiModal(c.siren));
  document.getElementById('drawerOverlay').classList.add('open'); document.getElementById('companyDrawer').classList.add('open');
}
function renderCompanyKpis(siren){
  const list=(getInternal(siren).kpis||[]); document.getElementById('companyKpiList').innerHTML=list.length?list.map((k,i)=>`<div class="kpi-row"><span><b>${esc(k.name)}</b><small>${esc(k.comment||'')}</small></span><b>${esc(k.value)} ${esc(k.unit)}</b><span>Obj. ${esc(k.target)} ${esc(k.unit)}</span><span class="badge ${Number(k.value)>=Number(k.target)?'green':'orange'}">${Number(k.value)>=Number(k.target)?'Atteint':'À suivre'}</span><button class="icon-btn" data-kpi-remove="${i}">×</button></div>`).join(''):`<div class="empty-inline">Aucun KPI personnalisé. Ajoutez-en pour illustrer le suivi métier.</div>`;
  document.querySelectorAll('[data-kpi-remove]').forEach(b=>b.addEventListener('click',()=>{const old=getInternal(siren),k=[...(old.kpis||[])];k.splice(Number(b.dataset.kpiRemove),1);internal[siren]={...old,kpis:k};saveInternal();renderCompanyKpis(siren);}));
}
function openKpiModal(siren){document.getElementById('kpiCompanySiren').value=siren;document.getElementById('kpiModalOverlay').classList.add('open')}
function closeKpiModal(){document.getElementById('kpiModalOverlay').classList.remove('open');document.getElementById('kpiForm').reset()}

function setupGlobal(){
  document.getElementById('drawerClose').addEventListener('click',closeDrawer); document.getElementById('drawerOverlay').addEventListener('click',closeDrawer);
  document.getElementById('kpiModalClose').addEventListener('click',closeKpiModal); document.getElementById('kpiCancel').addEventListener('click',closeKpiModal);
  document.getElementById('kpiForm').addEventListener('submit',e=>{e.preventDefault();const siren=document.getElementById('kpiCompanySiren').value,old=getInternal(siren),kpis=[...(old.kpis||[])];kpis.push({name:document.getElementById('kpiName').value,unit:document.getElementById('kpiUnit').value,value:document.getElementById('kpiValue').value,target:document.getElementById('kpiTarget').value,comment:document.getElementById('kpiComment').value});internal[siren]={...old,kpis};saveInternal();closeKpiModal();renderCompanyKpis(siren);});
  document.getElementById('performanceFilter').addEventListener('change',renderPerformance);
  document.getElementById('exportBtn').addEventListener('click',()=>{const payload=companies.map(c=>({...c,simulation:simulatedFinance(c),internal:getInternal(c.siren)}));const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='groupe-parfait-demo-enrichie.json';a.click();URL.revokeObjectURL(a.href);});
}
function closeDrawer(){document.getElementById('drawerOverlay').classList.remove('open');document.getElementById('companyDrawer').classList.remove('open')}

setupNav(); setupCompanyFilters(); setupGlobal(); renderOverview(); renderPerformance(); renderMap(); renderConnections();
