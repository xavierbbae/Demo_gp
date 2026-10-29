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
const selectedCompanies = new Set();
let kpiTargets = [];
const TRAININGS_KEY = 'parfait_trainings_v1';
const DEFAULT_TRAINING_EMAIL = 'xymapartners.contact@gmail.com';
const groupCategories = ['Immobilier', 'Automobile', 'Alimentaire', 'Industrie'];
const accountingSoftwareOptions = ['Sage', 'Cegid', 'Pennylane', 'EBP', 'Odoo', 'SAP', 'Oracle NetSuite', 'Microsoft Dynamics', 'QuickBooks', 'ACD'];
const softwareTypeOptions = ['Gestion commerciale', 'ERP', 'CRM', 'Paie / RH', 'Stocks', 'Gestion immobilière', 'Formation', 'Facturation', 'Gestion de projets', 'Trésorerie', 'Gestion documentaire', 'Reporting et BI'];
const SOFTWARE_TYPES_KEY = 'parfait_software_types_v1';
const otherSoftwareOptions = ['Odoo', 'SAP', 'Microsoft Dynamics', 'Salesforce', 'Silae', 'PayFit', 'Shopify', 'Monday.com', 'Excel'];
let mapMode = 'category';
let mapGroup = null;
let mapSoftware = null;
let mapCompany = null;
let showMapSamples = true;
const mapColors = ['#80543a', '#b67951', '#a88363', '#6c5145', '#978c83'];
const mapSamples = {
  '338539232': {accounting:'Sage',other:[{type:'Gestion immobilière',name:'Odoo'},{type:'CRM',name:'Salesforce'},{type:'Trésorerie',name:'Agicap'}],kpis:[{name:'Taux d’occupation',unit:'%',value:94,target:92},{name:'Loyers encaissés',unit:'%',value:97,target:96},{name:'Délai de relocation',unit:'jours',value:24,target:20}]},
  '404427221': {accounting:'Cegid',other:[{type:'Gestion immobilière',name:'Odoo'},{type:'Paie / RH',name:'Silae'},{type:'Gestion documentaire',name:'SharePoint'},{type:'Formation',name:'360Learning'}],kpis:[{name:'Lots gérés',unit:'lots',value:1280,target:1250},{name:'Charges recouvrées',unit:'%',value:95,target:97},{name:'Dossiers traités',unit:'%',value:89,target:90}]},
  '488308198': {accounting:'Sage',other:[{type:'Gestion commerciale',name:'Odoo'},{type:'CRM',name:'Salesforce'},{type:'Facturation',name:'Sellsy'}],kpis:[{name:'Véhicules vendus',unit:'unités',value:68,target:72},{name:'Marge commerciale',unit:'%',value:19,target:18},{name:'Rotation du stock',unit:'jours',value:41,target:38}]},
  '451715767': {accounting:'EBP',other:[{type:'Gestion commerciale',name:'Odoo'}],kpis:[{name:'Interventions réalisées',unit:'unités',value:156,target:150},{name:'Satisfaction client',unit:'%',value:91,target:92},{name:'Délai moyen',unit:'jours',value:3,target:4}]},
  '451369318': {accounting:'Pennylane',other:[{type:'Stocks',name:'Odoo'},{type:'Gestion commerciale',name:'Shopify'}],kpis:[{name:'Commandes livrées',unit:'unités',value:840,target:800},{name:'Ruptures de stock',unit:'%',value:4,target:3},{name:'Marge brute',unit:'%',value:27,target:26}]},
  '799840954': {accounting:'Cegid',other:[{type:'Stocks',name:'SAP'},{type:'CRM',name:'Salesforce'},{type:'Reporting et BI',name:'Power BI'}],kpis:[{name:'Points de vente actifs',unit:'sites',value:23,target:22},{name:'Disponibilité produits',unit:'%',value:96,target:97},{name:'Pertes alimentaires',unit:'%',value:2.8,target:2.5}]},
  '510498264': {accounting:'Sage',other:[{type:'ERP',name:'SAP'},{type:'Stocks',name:'SAP'}],kpis:[{name:'Production mensuelle',unit:'unités',value:12400,target:12000},{name:'Taux de disponibilité',unit:'%',value:93,target:95},{name:'Rebuts',unit:'%',value:1.9,target:2}]},
  '510181274': {accounting:'EBP',other:[{type:'ERP',name:'Odoo'},{type:'Paie / RH',name:'PayFit'},{type:'Gestion de projets',name:'Monday.com'}],kpis:[{name:'Commandes produites',unit:'unités',value:410,target:400},{name:'Livraisons à temps',unit:'%',value:88,target:92},{name:'Accidents avec arrêt',unit:'unités',value:0,target:0}]}
};

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
function groupCategory(c){
  const saved=getInternal(c.siren);
  const chosen=saved.groupCategory??saved.categorie_groupe;
  if(chosen!==undefined)return groupCategories.find(category=>category.toLowerCase()===String(chosen).trim().toLowerCase())||'';
  const code=c.activite_principale||'';
  if(code.startsWith('68.'))return 'Immobilier';
  if(code.startsWith('45.')||code.startsWith('77.11'))return 'Automobile';
  if(code.startsWith('10.')||code.startsWith('46.3')||code.startsWith('47.11')||code.startsWith('47.2')||code.startsWith('56.'))return 'Alimentaire';
  if(['B','C','D','E'].includes(c.section_activite_principale))return 'Industrie';
  return '';
}
function accountingSoftware(c){return getInternal(c.siren).accountingSoftware||''}
function otherSoftware(c){const list=getInternal(c.siren).otherSoftware;return Array.isArray(list)?list.filter(item=>item&&item.type&&item.name):[]}
function availableSoftwareTypes(){
  let saved=[];
  try{const value=JSON.parse(localStorage.getItem(SOFTWARE_TYPES_KEY));if(Array.isArray(value))saved=value}catch{}
  const assigned=Object.values(internal).flatMap(record=>Array.isArray(record?.otherSoftware)?record.otherSoftware.map(item=>item?.type):[]);
  return [...new Set([...softwareTypeOptions,...saved,...assigned].filter(type=>typeof type==='string'&&type.trim()).map(type=>type.trim()))];
}
function registerSoftwareType(type){
  const existing=availableSoftwareTypes().find(value=>value.toLowerCase()===type.toLowerCase());
  if(existing)return existing;
  const saved=availableSoftwareTypes().filter(value=>!softwareTypeOptions.includes(value));
  localStorage.setItem(SOFTWARE_TYPES_KEY,JSON.stringify([...saved,type]));
  return type;
}
function softwareOptions(options,selected){return options.map(value=>`<option value="${esc(value)}" ${selected===value?'selected':''}>${esc(value)}</option>`).join('')}
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
  const titles={overview:['PILOTAGE GROUPE','Vue d\'ensemble'],companies:['RÉFÉRENTIEL','Entreprises'],performance:['ANALYSE FINANCIÈRE','Performance'],map:['STRUCTURE','Cartographie'],connections:['INTÉGRATIONS','Connexions comptables'],registrations:['FORMATIONS','Formations']};
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active')); const target=document.getElementById(name+'View'); if(target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===name));
  document.getElementById('pageEyebrow').textContent=titles[name][0]; document.getElementById('pageTitle').textContent=titles[name][1];
  if(name==='companies')renderCompanies(); if(name==='performance')renderPerformance(); if(name==='map')renderMap(); if(name==='connections')renderConnections(); if(name==='registrations')renderTrainings();
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

  const sec={};companies.forEach(c=>{const category=groupCategory(c)||'À classer';sec[category]=(sec[category]||0)+1}); const sorted=Object.entries(sec).sort((a,b)=>b[1]-a[1]), max=sorted[0]?.[1]||1;
  document.getElementById('sectorBars').innerHTML=sorted.map(([s,v])=>`<div class="sector-row"><span>${esc(s)}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><b>${v}</b></div>`).join('');

  const connected=connectionCount();
  document.getElementById('automationCard').innerHTML=`<div class="automation-icon">↻</div><div><b>${connected?connected+' entreprise'+(connected>1?'s':'')+' connectée'+(connected>1?'s':'')+' en démo':'Suivre les connexions comptables'}</b><p>${connected?'Dernières synchronisations simulées, par entreprise.':'Renseignez le logiciel de chaque société et suivez son statut de connexion.'}</p></div><button class="btn primary" onclick="showView('connections')">${connected?'Voir le suivi':'Configurer'}</button>`;
}

function setupCompanyFilters(){
  ['companySearch','statusFilter','sectorFilter','accountingFilter','managerFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='companySearch'?'input':'change',renderCompanies));
  document.getElementById('selectVisibleCompanies').addEventListener('change',e=>{document.querySelectorAll('#companiesTable input[data-select-siren]').forEach(input=>{if(e.target.checked)selectedCompanies.add(input.dataset.selectSiren);else selectedCompanies.delete(input.dataset.selectSiren)});renderCompanies()});
  document.getElementById('clearSelectionBtn').addEventListener('click',()=>{selectedCompanies.clear();renderCompanies()});
  document.getElementById('bulkKpiBtn').addEventListener('click',()=>openKpiModal([...selectedCompanies]));
}
function renderCompanies(){
  const q=document.getElementById('companySearch').value.trim().toLowerCase(),st=document.getElementById('statusFilter').value,sec=document.getElementById('sectorFilter').value,accounting=document.getElementById('accountingFilter').value,mgr=document.getElementById('managerFilter').value;
  const accountingFilter=document.getElementById('accountingFilter');
  const available=[...new Set(companies.map(accountingSoftware).filter(Boolean))].sort((left,right)=>left.localeCompare(right,'fr'));
  accountingFilter.innerHTML='<option value="all">Tous les logiciels comptables</option><option value="">Non renseigné</option>'+softwareOptions(available,accounting);
  accountingFilter.value=available.includes(accounting)||accounting===''?accounting:'all';
  let rows=companies.filter(c=>{ const hay=[c.nom_complet,c.siren,c.siret_siege,c.ville,c.adresse,c.activite_principale,groupCategory(c),accountingSoftware(c),...otherSoftware(c).flatMap(item=>[item.type,item.name])].join(' ').toLowerCase(); const okMgr=mgr==='all'||(mgr==='robert'&&c.dirigeant_robert)||(mgr==='kevin'&&c.dirigeant_kevin)||(mgr==='both'&&c.dirigeant_robert&&c.dirigeant_kevin); return (!q||hay.includes(q))&&(st==='all'||c.etat_administratif===st)&&(sec==='all'||groupCategory(c)===sec)&&(accountingFilter.value==='all'||accountingSoftware(c)===accountingFilter.value)&&okMgr; });
  document.getElementById('companyCount').textContent=`${rows.length} / ${companies.length} sociétés`;
  document.getElementById('companiesTable').innerHTML=rows.length?rows.map(c=>{const f=simulatedFinance(c); return `<tr data-siren="${c.siren}"><td><input type="checkbox" data-select-siren="${c.siren}" aria-label="Sélectionner ${esc(c.nom_complet)}" ${selectedCompanies.has(c.siren)?'checked':''}></td><td><div class="company-name">${esc(c.nom_complet)}</div><div class="company-sub">${esc(managerLabel(c))}</div></td><td>${c.siren}</td><td>${esc(groupCategory(c)||'À classer')}</td><td>${esc(accountingSoftware(c)||'Non renseigné')}</td><td><div>${esc(sector(c))}</div><div class="company-sub">${esc(c.activite_principale||'')}</div></td><td>${esc(c.ville||'N/D')}</td><td>${esc(employeeLabel(c))}</td><td class="money">${fmtMoney(f.ytd)}</td><td class="${f.trend>=0?'positive':'negative'}">${f.trend>=0?'+':''}${f.trend.toFixed(1)} %</td><td><span class="badge ${c.etat_administratif==='A'?'active':'closed'}">${c.etat_administratif==='A'?'Active':'Fermée'}</span></td><td>›</td></tr>`}).join(''):`<tr><td colspan="12" class="empty">Aucune société ne correspond aux filtres.</td></tr>`;
  document.querySelectorAll('#companiesTable tr[data-siren]').forEach(row=>row.addEventListener('click',e=>{if(e.target.closest('input'))return;openCompany(row.dataset.siren)}));
  document.querySelectorAll('#companiesTable input[data-select-siren]').forEach(input=>input.addEventListener('change',()=>{if(input.checked)selectedCompanies.add(input.dataset.selectSiren);else selectedCompanies.delete(input.dataset.selectSiren);updateCompanySelection(rows)}));
  updateCompanySelection(rows);
}

function updateCompanySelection(rows){
  const count=selectedCompanies.size;
  document.getElementById('selectedCount').textContent=`${count} entreprise${count>1?'s':''} sélectionnée${count>1?'s':''}`;
  document.getElementById('bulkKpiBtn').disabled=count===0;
  document.getElementById('clearSelectionBtn').disabled=count===0;
  const selectAll=document.getElementById('selectVisibleCompanies');
  selectAll.checked=rows.length>0&&rows.every(c=>selectedCompanies.has(c.siren));
  selectAll.indeterminate=!selectAll.checked&&rows.some(c=>selectedCompanies.has(c.siren));
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

function groupKpis(list){
  const indicators=new Map();
  list.forEach(c=>mapKpis(c).forEach(kpi=>{
    const value=Number(kpi.value),target=Number(kpi.target);
    if(!Number.isFinite(value)||!Number.isFinite(target))return;
    const key=JSON.stringify([kpi.name,kpi.unit]);
    const current=indicators.get(key)||{name:kpi.name,unit:kpi.unit,count:0,value:0,target:0};
    current.count++;current.value+=value;current.target+=target;indicators.set(key,current);
  }));
  return [...indicators.values()].sort((left,right)=>right.count-left.count).slice(0,6);
}
function mapCategory(c){return groupCategory(c)||'À classer'}
function mapSample(c){return showMapSamples?mapSamples[c.siren]:null}
function mapKpis(c){const saved=getInternal(c.siren);return Object.hasOwn(saved,'kpis')?saved.kpis||[]:mapSample(c)?.kpis||[]}
function mapAccounting(c){
  const saved=getInternal(c.siren);
  return Object.hasOwn(saved,'accountingSoftware')?accountingSoftware(c):mapSample(c)?.accounting||'';
}
function mapOtherSoftware(c){
  const saved=getInternal(c.siren);
  return Object.hasOwn(saved,'otherSoftware')?otherSoftware(c):mapSample(c)?.other||[];
}
function mapUsesSample(c){
  const sample=mapSample(c),saved=getInternal(c.siren);
  return Boolean(sample&&(!Object.hasOwn(saved,'accountingSoftware')||!Object.hasOwn(saved,'otherSoftware')||!Object.hasOwn(saved,'kpis')));
}
function mapFamilies(){
  const types=new Set([...availableSoftwareTypes(),...companies.flatMap(c=>mapOtherSoftware(c).map(item=>item.type))]);
  return ['Comptabilité',...[...types].filter(type=>type!=='Comptabilité')];
}
function mapTools(c,family){
  if(family==='Comptabilité'){
    const names=[mapAccounting(c),...mapOtherSoftware(c).filter(item=>item.type===family).map(item=>item.name)].filter(Boolean);
    return names.length?[...new Set(names)]:['Non renseigné'];
  }
  return [...new Set(mapOtherSoftware(c).filter(item=>item.type===family).map(item=>item.name))];
}
function mapKnownTools(c,family){return mapTools(c,family).filter(name=>name!=='Non renseigné')}
function mapMatches(c,query){
  if(!query)return true;
  return [c.nom_complet,c.siren,mapCategory(c),mapAccounting(c)?'Comptabilité':'',mapAccounting(c),...mapOtherSoftware(c).flatMap(item=>[item.type,item.name])].join(' ').toLocaleLowerCase('fr').includes(query);
}
function mapFinance(list){
  const revenue=list.reduce((sum,c)=>sum+simulatedFinance(c).ytd,0);
  const result=list.reduce((sum,c)=>sum+simulatedFinance(c).monthly.slice(2).reduce((total,month)=>total+month.result,0),0);
  const score=list.length?Math.round(list.reduce((sum,c)=>sum+demoMetrics(c).score,0)/list.length):0;
  return {revenue,result,score};
}
function mapCard(label,count,detail,color,active,action,width){
  return `<button type="button" class="map-node ${active?'active':''}" style="--map-color:${color}" ${action} aria-pressed="${active}"><span class="map-node-top"><strong>${esc(label)}</strong><span class="map-node-count">${count}</span></span><span class="map-node-track"><span style="width:${width}%"></span></span><small>${esc(detail)}</small></button>`;
}
function mapInsightRows(entries,total){
  const maximum=Math.max(1,...entries.map(entry=>entry.count));
  return `<div class="map-insight-list">${entries.map(entry=>`<div class="map-insight-row" style="--map-color:${entry.color}"><span title="${esc(entry.label)}">${esc(entry.label)}</span><b>${entry.count}${total?` · ${Math.round(entry.count/total*100)} %`:''}</b><div class="map-insight-track"><span style="width:${entry.count/maximum*100}%"></span></div></div>`).join('')}</div>`;
}
function mapSelectionInsights(title,list,distribution){
  const finance=mapFinance(list),kpis=groupKpis(list);
  return `<h4>${esc(title)}</h4><p>${list.length} entreprise${list.length>1?'s':''} dans cette sélection${list.some(mapUsesSample)?` · ${list.filter(mapUsesSample).length} avec données d'exemple`:''}</p><div class="map-insight-metrics"><div><small>CA à date simulé</small><b>${fmtMoney(finance.revenue)}</b></div><div><small>Résultat simulé</small><b>${fmtMoney(finance.result)}</b></div><div><small>Score moyen</small><b>${finance.score} / 100</b></div><div><small>Logiciels présentés</small><b>${new Set(list.flatMap(c=>[mapAccounting(c),...mapOtherSoftware(c).map(item=>item.name)]).filter(Boolean)).size}</b></div></div><div class="map-insight-divider"></div><h4>KPI personnalisés</h4><div class="map-insight-kpis">${kpis.length?kpis.map(kpi=>`<div class="map-insight-kpi"><b>${esc(kpi.name)}</b><span>Moy. ${(kpi.value/kpi.count).toLocaleString('fr-FR',{maximumFractionDigits:1})} ${esc(kpi.unit)} · Obj. ${(kpi.target/kpi.count).toLocaleString('fr-FR',{maximumFractionDigits:1})} ${esc(kpi.unit)} · ${kpi.count} valeur${kpi.count>1?'s':''}</span></div>`).join(''):'<p>Aucun KPI personnalisé pour cette sélection.</p>'}</div>${distribution?`<div class="map-insight-divider"></div>${distribution}`:''}`;
}
function mapColor(category){const index=groupCategories.indexOf(category);return mapColors[index<0?4:index]}
function mapSegments(list){
  return `<span class="map-segments">${[...groupCategories,'À classer'].map(category=>{const count=list.filter(c=>mapCategory(c)===category).length;return count?`<span style="width:${count/(list.length||1)*100}%;background:${mapColor(category)}" title="${esc(category)} : ${count}"></span>`:''}).join('')}</span>`;
}
function mapComparator(family,visible,selectedTool){
  const names=[...new Set(visible.flatMap(c=>mapTools(c,family)))].sort((a,b)=>a.localeCompare(b,'fr'));
  if(!names.length)return '<p>Aucun logiciel dans cette famille.</p>';
  return `<div class="map-insight-divider"></div><h4>Comparateur par pôle</h4><p>Entreprises par logiciel et par pôle</p><div class="map-comparator-scroll"><table class="map-comparator"><thead><tr><th>Logiciel</th>${groupCategories.map(category=>`<th title="${esc(category)}" style="--map-color:${mapColor(category)}">${esc(category.slice(0,4))}.</th>`).join('')}<th>Total</th></tr></thead><tbody>${names.map(name=>{const users=visible.filter(c=>mapTools(c,family).includes(name));return `<tr class="${selectedTool===name?'active':''}"><th><button type="button" data-map-jump-tool="${esc(name)}">${esc(name)}</button></th>${groupCategories.map(category=>{const count=users.filter(c=>mapCategory(c)===category).length;return `<td><button type="button" data-map-jump-cell="${esc(name)}" data-map-jump-category="${esc(category)}" ${count?'':'disabled'}>${count||'–'}</button></td>`}).join('')}<td><b>${users.length}</b></td></tr>`}).join('')}</tbody></table></div><p>Un logiciel ouvre ses entreprises ; un chiffre filtre le pôle concerné.</p>`;
}
function mapSoftwareMix(list){
  const entries=mapFamilies().map(family=>({family,tools:[...new Set(list.flatMap(c=>mapKnownTools(c,family)))].map(name=>({name,count:list.filter(c=>mapKnownTools(c,family).includes(name)).length}))})).filter(item=>item.tools.length);
  return `<div class="map-insight-divider"></div><h4>Outils utilisés par famille</h4><p>Nombre d’entreprises du pôle par logiciel</p><div class="map-insight-list">${entries.map(item=>`<button type="button" class="map-insight-link" data-map-jump-family="${esc(item.family)}"><span><small>${esc(item.family)}</small><strong>${item.tools.sort((a,b)=>b.count-a.count).map(tool=>`${esc(tool.name)} ${tool.count}`).join(' · ')}</strong></span><b>${item.tools.length} outil${item.tools.length>1?'s':''} ›</b></button>`).join('')}</div>`;
}
function mapCompanyInsights(c){
  const finance=simulatedFinance(c),kpis=mapKpis(c),tools=[['Comptabilité',mapAccounting(c)||'Non renseigné'],...mapOtherSoftware(c).map(item=>[item.type,item.name])];
  return `<div class="map-company-detail"><span class="map-detail-eyebrow">FICHE ENTREPRISE</span><h4>${esc(c.nom_complet)}</h4><p>${esc(c.siren)} · ${esc(mapCategory(c))}</p>${mapUsesSample(c)?'<span class="map-sample-badge">Données fictives de démonstration</span>':''}<div class="map-insight-divider"></div><div class="map-insight-metrics"><div><small>CA à date simulé</small><b>${fmtMoney(finance.ytd)}</b></div><div><small>Score simulé</small><b>${demoMetrics(c).score} / 100</b></div></div><div class="map-insight-divider"></div><h4>Logiciels utilisés</h4><div class="map-detail-list">${tools.map(([family,name])=>`<div><span>${esc(family)}</span><b>${esc(name)}</b></div>`).join('')}</div><div class="map-insight-divider"></div><h4>KPI de l’entreprise</h4><div class="map-insight-kpis">${kpis.length?kpis.map(kpi=>`<div class="map-insight-kpi"><b>${esc(kpi.name)}</b><span>${esc(kpi.value)} ${esc(kpi.unit)} · Objectif ${esc(kpi.target)} ${esc(kpi.unit)}</span></div>`).join(''):'<p>Aucun KPI renseigné.</p>'}</div><button type="button" class="btn primary map-detail-edit" data-map-edit-company="${esc(c.siren)}">Ouvrir la fiche modifiable ↗</button></div>`;
}
function mapDrawLinks(){
  const canvas=document.getElementById('mapCanvas'),svg=canvas.querySelector('.map-links');
  if(!svg||matchMedia('(max-width:700px)').matches)return;
  const source=canvas.querySelector(mapMode==='category'?'#mapRoot':mapGroup?'[data-map-group].active':'#mapRoot');
  const targets=mapMode==='category'?(mapGroup?canvas.querySelectorAll('[data-map-company]'):canvas.querySelectorAll('[data-map-group]')):mapSoftware?canvas.querySelectorAll('[data-map-company]'):mapGroup?canvas.querySelectorAll('[data-map-software]'):canvas.querySelectorAll('[data-map-group]');
  const start=mapMode==='software'&&mapSoftware?canvas.querySelector('[data-map-software].active'):mapMode==='category'&&mapGroup?canvas.querySelector('[data-map-group].active'):source;
  if(!start)return;
  const origin=canvas.getBoundingClientRect(),from=start.getBoundingClientRect();
  svg.setAttribute('width',canvas.scrollWidth);svg.setAttribute('height',canvas.scrollHeight);
  svg.innerHTML=[...targets].slice(0,30).map(target=>{const to=target.getBoundingClientRect(),x1=from.right-origin.left+canvas.scrollLeft,y1=from.top+from.height/2-origin.top,x2=to.left-origin.left+canvas.scrollLeft,y2=to.top+to.height/2-origin.top,middle=x1+(x2-x1)/2;return x2>x1?`<path d="M${x1} ${y1} H${middle} V${y2} H${x2}" />`:''}).join('');
}
function renderMap(){
  const query=document.getElementById('mapSearch').value.trim().toLocaleLowerCase('fr');
  const visible=companies.filter(c=>mapMatches(c,query));
  const categories=[...groupCategories,...(visible.some(c=>mapCategory(c)==='À classer')?['À classer']:[])];
  const families=mapFamilies();
  const groups=mapMode==='category'?categories:families;
  if(mapGroup&&!groups.includes(mapGroup)){mapGroup=null;mapSoftware=null}
  const members=mapGroup?visible.filter(c=>mapMode==='category'?mapCategory(c)===mapGroup:mapTools(c,mapGroup).length>0):[];
  const tools=mapMode==='software'&&mapGroup?[...new Set(members.flatMap(c=>mapTools(c,mapGroup)))].sort((left,right)=>left.localeCompare(right,'fr')):[];
  if(mapSoftware&&!tools.includes(mapSoftware))mapSoftware=null;
  const selected=mapMode==='software'&&mapSoftware?members.filter(c=>mapTools(c,mapGroup).includes(mapSoftware)):members;
  if(mapCompany&&!selected.some(c=>c.siren===mapCompany))mapCompany=null;
  const distinctSoftware=new Set(visible.flatMap(c=>[mapAccounting(c),...mapOtherSoftware(c).map(item=>item.name)]).filter(Boolean)).size;
  const sampleCount=visible.filter(mapUsesSample).length;
  document.getElementById('mapSummary').innerHTML=`<div class="map-summary-item"><b>${visible.length}</b><span>entreprises${query?' trouvées':' dans le référentiel'}</span></div><div class="map-summary-item"><b>${distinctSoftware}</b><span>logiciels distincts</span></div><div class="map-summary-item"><b>${groupCategories.length}</b><span>pôles du groupe</span></div><div class="map-summary-item"><b>${sampleCount}</b><span>fiches d’exemple</span></div>`;
  document.getElementById('mapToolbar').innerHTML=`<button type="button" class="map-back" id="mapBack" ${mapGroup?'':'disabled'}>← Retour</button><div class="map-crumbs"><button type="button" data-map-crumb="root">Cartographie</button><span>›</span><button type="button" data-map-crumb="mode">${mapMode==='category'?'Pôles':'Logiciels'}</button>${mapGroup?`<span>›</span><button type="button" data-map-crumb="group">${esc(mapGroup)}</button>`:''}${mapSoftware?`<span>›</span><b>${esc(mapSoftware)}</b>`:''}</div><div class="map-legend">${groupCategories.map(category=>`<span><i style="background:${mapColor(category)}"></i>${esc(category)}</span>`).join('')}</div>`;
  document.querySelectorAll('[data-map-mode]').forEach(button=>{const active=button.dataset.mapMode===mapMode;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active)});
  const column=(title,count,content,extra='')=>`<div class="map-column ${extra}"><div class="map-column-head"><span>${esc(title)}</span><b>${count}</b></div><div class="map-node-list">${content}</div></div>`;
  const root=column('Groupe',visible.length,`<button type="button" class="map-root" id="mapRoot"><span class="map-root-mark">P</span><strong>Groupe Parfait</strong><small>${visible.length} entreprises · ${mapMode==='category'?'4 catégories':`${families.length} familles logicielles`}</small></button>`);
  const groupCards=groups.filter(name=>!query||(mapMode==='category'?visible.some(c=>mapCategory(c)===name):visible.some(c=>mapTools(c,name).length))).map((name,index)=>{
    const list=visible.filter(c=>mapMode==='category'?mapCategory(c)===name:mapTools(c,name).length>0);
    const count=mapMode==='category'?list.length:new Set(list.flatMap(c=>mapKnownTools(c,name))).size;
    const knownCount=mapMode==='software'?list.filter(c=>mapKnownTools(c,name).length>0).length:0;
    const detail=mapMode==='category'?`${Math.round(list.length/(visible.length||1)*100)} % du groupe · ${new Set(list.flatMap(c=>[mapAccounting(c),...mapOtherSoftware(c).map(item=>item.name)]).filter(Boolean)).size} logiciels`:`${knownCount} entreprise${knownCount>1?'s':''} présentée${knownCount>1?'s':''} · ${count} logiciel${count>1?'s':''}`;
    const color=mapMode==='category'?mapColor(name):mapColors[index%mapColors.length];
    return `<button type="button" class="map-node ${mapMode==='category'?'map-pole-node':'map-family-node'} ${mapGroup===name?'active':''}" style="--map-color:${color}" data-map-group="${esc(name)}" aria-pressed="${mapGroup===name}"><span class="map-node-top"><span class="map-node-icon">${mapMode==='category'?'●':'▤'}</span><strong>${esc(name)}</strong><span class="map-node-count">${count}</span></span>${mapMode==='category'?`<span class="map-node-track"><span style="width:${Math.round(list.length/(visible.length||1)*100)}%"></span></span>`:''}<small>${esc(detail)}</small></button>`;
  }).join('')||'<div class="map-empty"><b>Aucun résultat</b>Essayez une autre recherche.</div>';
  const groupColumn=column(mapMode==='category'?'Catégories':'Familles',groups.length,groupCards);
  const softwareCards=tools.map((name,index)=>{const users=members.filter(c=>mapTools(c,mapGroup).includes(name)),count=users.length;return `<button type="button" class="map-node map-tool-node ${mapSoftware===name?'active':''}" style="--map-color:${mapColors[index%mapColors.length]}" data-map-software="${esc(name)}" aria-pressed="${mapSoftware===name}"><span class="map-node-top"><span class="map-tool-mark">${esc(name.slice(0,2))}</span><strong>${esc(name)}</strong></span><small>${count} entreprise${count>1?'s':''}</small>${mapSegments(users)}</button>`}).join('');
  const softwareColumn=mapMode==='software'?column('Logiciels',tools.length,mapGroup?softwareCards||'<div class="map-empty"><b>Aucun logiciel renseigné</b>Renseignez-le dans une fiche entreprise.</div>':'<div class="map-empty"><b>Sélectionnez une famille</b>Ses logiciels apparaîtront ici.</div>','software'):'';
  const companyList=selected.slice().sort((left,right)=>left.nom_complet.localeCompare(right.nom_complet,'fr'));
  const companyCards=companyList.map(c=>`<button type="button" class="map-company ${mapCompany===c.siren?'active':''}" style="--map-color:${mapColor(mapCategory(c))}" data-map-company="${c.siren}"><strong>${esc(c.nom_complet)}</strong><small><span class="map-company-tag">${esc(mapCategory(c))}</span> ${esc(c.activite_principale||'')} · ${esc(c.siren)}</small><small>${mapKpis(c).length} KPI · ${[mapAccounting(c),...mapOtherSoftware(c).map(item=>item.name)].filter(Boolean).length} logiciels ${mapUsesSample(c)?'· Exemple fictif':''}</small></button>`).join('');
  const ready=mapMode==='category'?Boolean(mapGroup):Boolean(mapSoftware);
  const companiesColumn=column(mapSoftware?`Utilisatrices de ${mapSoftware}`:'Entreprises',ready?companyList.length:'—',ready?companyCards||'<div class="map-empty"><b>Aucune entreprise</b>Cette sélection est vide.</div>':`<div class="map-empty"><b>${mapMode==='category'?'Sélectionnez un pôle':'Sélectionnez un logiciel'}</b>Les entreprises apparaîtront ici.</div>`,'companies');
  document.getElementById('mapCanvas').innerHTML='<svg class="map-links" aria-hidden="true"></svg>'+root+groupColumn+softwareColumn+companiesColumn;
  const distribution=groups.map((name,index)=>({label:name,count:visible.filter(c=>mapMode==='category'?mapCategory(c)===name:mapKnownTools(c,name).length>0).length,color:mapColors[mapMode==='category'?groupCategories.indexOf(name)<0?4:groupCategories.indexOf(name):index%mapColors.length]}));
  const distributionHtml=`<h4>${mapMode==='category'?'Répartition des entreprises':'Couverture par famille'}</h4><p>${mapMode==='category'?'Entreprises par catégorie groupe':'Entreprises avec un logiciel présenté dans chaque famille'}</p>${mapInsightRows(distribution,mapMode==='category'?visible.length:0)}`;
  const categoryInsights=mapGroup?mapSelectionInsights(mapGroup,selected,'')+mapSoftwareMix(selected):distributionHtml+`<div class="map-insight-divider"></div><p>Cliquez sur un pôle pour afficher ses entreprises, leurs logiciels et leurs KPI.</p>`;
  const toolUsers=mapSoftware?selected:[];
  const toolDistribution=mapSoftware?`<h4>${esc(mapSoftware)}</h4><p>${toolUsers.length} entreprise${toolUsers.length>1?'s':''} utilisatrice${toolUsers.length>1?'s':''} dans ${new Set(toolUsers.map(mapCategory)).size} pôle(s)</p>${mapSegments(toolUsers)}${mapInsightRows(groupCategories.map(category=>({label:category,count:toolUsers.filter(c=>mapCategory(c)===category).length,color:mapColor(category)})),toolUsers.length)}`:'';
  const softwareInsights=mapGroup?(mapSoftware?toolDistribution+mapComparator(mapGroup,visible,mapSoftware):mapSelectionInsights(mapGroup,members,'')+mapComparator(mapGroup,visible,'')):distributionHtml+'<div class="map-insight-divider"></div><p>Sélectionnez une famille pour comparer ses logiciels par pôle.</p>';
  document.getElementById('mapInsights').innerHTML=mapCompany?mapCompanyInsights(companies.find(c=>c.siren===mapCompany)):(mapMode==='category'?categoryInsights:softwareInsights);
  document.getElementById('mapRoot').addEventListener('click',()=>{mapGroup=null;mapSoftware=null;mapCompany=null;renderMap()});
  document.getElementById('mapBack').addEventListener('click',()=>{if(mapCompany)mapCompany=null;else if(mapSoftware)mapSoftware=null;else mapGroup=null;renderMap()});
  document.querySelectorAll('[data-map-crumb]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.mapCrumb==='root'){mapGroup=null;mapSoftware=null}else if(button.dataset.mapCrumb==='mode'){mapGroup=null;mapSoftware=null}else if(button.dataset.mapCrumb==='group')mapSoftware=null;mapCompany=null;renderMap()}));
  document.querySelectorAll('[data-map-group]').forEach(button=>button.addEventListener('click',()=>{mapGroup=mapGroup===button.dataset.mapGroup?null:button.dataset.mapGroup;mapSoftware=null;mapCompany=null;renderMap()}));
  document.querySelectorAll('[data-map-software]').forEach(button=>button.addEventListener('click',()=>{mapSoftware=mapSoftware===button.dataset.mapSoftware?null:button.dataset.mapSoftware;mapCompany=null;renderMap()}));
  document.querySelectorAll('[data-map-company]').forEach(button=>button.addEventListener('click',()=>{mapCompany=button.dataset.mapCompany;renderMap()}));
  document.querySelectorAll('[data-map-edit-company]').forEach(button=>button.addEventListener('click',()=>openCompany(button.dataset.mapEditCompany)));
  document.querySelectorAll('[data-map-jump-family]').forEach(button=>button.addEventListener('click',()=>{mapMode='software';mapGroup=button.dataset.mapJumpFamily;mapSoftware=null;mapCompany=null;renderMap()}));
  document.querySelectorAll('[data-map-jump-tool]').forEach(button=>button.addEventListener('click',()=>{mapSoftware=button.dataset.mapJumpTool;mapCompany=null;renderMap()}));
  document.querySelectorAll('[data-map-jump-cell]').forEach(button=>button.addEventListener('click',()=>{mapSoftware=button.dataset.mapJumpCell;mapCompany=null;document.getElementById('mapSearch').value=button.dataset.mapJumpCategory;renderMap()}));
  requestAnimationFrame(mapDrawLinks);
}

function openCompany(siren){
  const c=companies.find(x=>x.siren===siren); if(!c)return; currentCompany=c; const int=getInternal(siren), f=simulatedFinance(c), dm=demoMetrics(c);
  const category=groupCategory(c),accounting=accountingSoftware(c),knownAccounting=accountingSoftwareOptions.includes(accounting);
  const publicCA=n(c.ca_public)>0?fmtMoney(c.ca_public):'N/D'; const resultPublic=n(c.resultat_net_public)!==null?fmtMoney(c.resultat_net_public):'N/D';
  document.getElementById('drawerContent').innerHTML=`
    <div class="drawer-header"><p class="eyebrow">Activité publique : ${esc(sector(c))} · Catégorie groupe : <span id="drawerGroupCategory">${esc(category||'À classer')}</span></p><h2>${esc(c.nom_complet)}</h2><p class="muted">SIREN ${c.siren} · ${esc(managerLabel(c))}</p></div>
    <div class="drawer-tabs"><button class="drawer-tab active" type="button" data-drawer-tab="details">Fiche entreprise</button><button class="drawer-tab" type="button" data-drawer-tab="notes">Note privée</button></div>
    <div class="drawer-body" id="companyDetailsPanel">
      <div class="notice" id="mapSampleNotice" hidden><b>Échantillon fictif.</b> La cartographie illustre des logiciels et des KPI pour cette entreprise sans les enregistrer dans sa fiche. Les champs ci-dessous sont les données réellement saisies.</div>
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
        <label>Catégorie groupe<select id="internalCategory"><option value="">À classer</option>${softwareOptions(groupCategories,category)}</select></label>
        <label>Logiciel comptable<select id="accountingSelect"><option value="">Non renseigné</option>${softwareOptions(accountingSoftwareOptions,accounting)}<option value="other" ${accounting&&!knownAccounting?'selected':''}>Autre logiciel…</option></select></label>
        <label id="accountingCustomLabel" hidden>Nom du logiciel comptable<input id="accountingCustom" maxlength="80" value="${esc(accounting&&!knownAccounting?accounting:'')}" placeholder="Saisir un logiciel"></label>
        <label class="full">Commentaire<textarea id="internalComment" rows="3" placeholder="Commentaire de gestion…">${esc(int.commentaire??'')}</textarea></label>
        <div class="form-actions full"><span id="internalSaveStatus" role="status"></span><button class="btn primary" type="submit">Enregistrer</button></div>
      </form>

      <div class="section-title">Autres logiciels utilisés</div>
      <div id="otherSoftwareList" class="other-software-list"></div>
      <form class="edit-form" id="otherSoftwareForm">
        <label>Type de logiciel<select id="otherTypeSelect" required><option value="">Choisir un type</option>${softwareOptions(availableSoftwareTypes(),'')}<option value="other">Autre type…</option></select></label>
        <label>Logiciel<select id="otherNameSelect" required><option value="">Choisir un logiciel</option>${softwareOptions(otherSoftwareOptions,'')}<option value="other">Autre logiciel…</option></select></label>
        <label id="otherTypeCustomLabel" hidden>Autre type<input id="otherTypeCustom" maxlength="80" placeholder="Ex. Gestion des interventions"></label>
        <label id="otherNameCustomLabel" hidden>Autre logiciel<input id="otherNameCustom" maxlength="80" placeholder="Nom du logiciel"></label>
        <div class="form-actions full"><button class="btn ghost" type="submit">+ Ajouter ce logiciel</button></div>
      </form>

      <div class="section-title">KPI internes</div><div class="kpi-list" id="companyKpiList"></div><button class="btn ghost" id="addKpiBtn">+ Ajouter un KPI</button>
    </div>
    <div class="drawer-body" id="companyNotesPanel" hidden>
      <div class="notice"><b>Note privée de démo.</b> Conservée uniquement sur cet appareil. Sans connexion utilisateur, elle n’est pas protégée contre les autres personnes utilisant ce navigateur.</div>
      <form id="privateNoteForm"><label for="privateNote">Votre note sur ${esc(c.nom_complet)}</label><textarea id="privateNote" rows="10" placeholder="Écrivez votre note interne…">${esc(int.privateNote??'')}</textarea><div class="form-actions"><button class="btn primary" type="submit">Enregistrer la note</button></div><p id="privateNoteStatus" role="status"></p></form>
    </div>`;
  renderCompanyKpis(c.siren);
  renderOtherSoftwareList(c.siren);
  setupCustomSelect('accountingSelect','accountingCustom');
  setupCustomSelect('otherTypeSelect','otherTypeCustom');
  setupCustomSelect('otherNameSelect','otherNameCustom');
  renderMapSampleNotice(c);
  document.getElementById('internalForm').addEventListener('submit',event=>{
    event.preventDefault();
    const saved=getInternal(c.siren),previousAccounting=accountingSoftware(c),selectedAccounting=document.getElementById('accountingSelect').value;
    const nextAccounting=selectedAccounting==='other'?document.getElementById('accountingCustom').value.trim():selectedAccounting;
    internal[c.siren]={...saved,effectif_interne:document.getElementById('internalEmployees').value,ca_interne:document.getElementById('internalRevenue').value,objectif_ca:document.getElementById('internalTarget').value,groupCategory:document.getElementById('internalCategory').value,accountingSoftware:nextAccounting,commentaire:document.getElementById('internalComment').value};
    if(previousAccounting!==nextAccounting || !Object.hasOwn(saved,'accountingSoftware'))clearConnectionRecord(c.siren);
    saveInternal();
    document.getElementById('internalSaveStatus').textContent='Enregistré sur cet appareil.';
    document.getElementById('drawerGroupCategory').textContent=groupCategory(c)||'À classer';
    renderMapSampleNotice(c);
    renderCompanies();renderOverview();renderMap();renderConnections();
  });
  document.getElementById('otherSoftwareForm').addEventListener('submit',event=>{
    event.preventDefault();
    const typeSelect=document.getElementById('otherTypeSelect').value,nameSelect=document.getElementById('otherNameSelect').value;
    const customType=typeSelect==='other'?document.getElementById('otherTypeCustom').value.trim():'';
    const type=typeSelect==='other'?customType:typeSelect;
    const name=nameSelect==='other'?document.getElementById('otherNameCustom').value.trim():nameSelect;
    if(!type||!name)return;
    const savedType=customType?registerSoftwareType(customType):type;
    const saved=getInternal(c.siren),software=[...otherSoftware(c)];
    if(!software.some(item=>item.type===savedType&&item.name===name))software.push({type:savedType,name});
    internal[c.siren]={...saved,otherSoftware:software};saveInternal();
    renderMapSampleNotice(c);
    renderOtherSoftwareList(c.siren);renderCompanies();renderMap();
    event.target.reset();document.getElementById('otherTypeSelect').innerHTML='<option value="">Choisir un type</option>'+softwareOptions(availableSoftwareTypes(),'')+'<option value="other">Autre type…</option>';document.getElementById('otherTypeSelect').dispatchEvent(new Event('change'));document.getElementById('otherNameSelect').dispatchEvent(new Event('change'));
  });
  document.getElementById('addKpiBtn').addEventListener('click',()=>openKpiModal(c.siren));
  document.querySelectorAll('[data-drawer-tab]').forEach(button=>button.addEventListener('click',()=>{const notes=button.dataset.drawerTab==='notes';document.getElementById('companyDetailsPanel').hidden=notes;document.getElementById('companyNotesPanel').hidden=!notes;document.querySelectorAll('[data-drawer-tab]').forEach(tab=>tab.classList.toggle('active',tab===button))}));
  document.getElementById('privateNoteForm').addEventListener('submit',e=>{e.preventDefault();internal[c.siren]={...getInternal(c.siren),privateNote:document.getElementById('privateNote').value};saveInternal();document.getElementById('privateNoteStatus').textContent='Note enregistrée sur cet appareil.'});
  document.getElementById('drawerOverlay').classList.add('open'); document.getElementById('companyDrawer').classList.add('open');
}
function renderMapSampleNotice(c){
  const notice=document.getElementById('mapSampleNotice');
  if(notice)notice.hidden=!document.getElementById('mapView').classList.contains('active')||!mapUsesSample(c);
}
function renderMapSearchResults(){
  const input=document.getElementById('mapSearch'),panel=document.getElementById('mapSearchResults'),query=input.value.trim().toLocaleLowerCase('fr');
  if(query.length<2){panel.hidden=true;input.setAttribute('aria-expanded','false');return}
  const names=[...new Set(companies.flatMap(c=>[mapAccounting(c),...mapOtherSoftware(c).map(item=>item.name)]).filter(Boolean))];
  const options=[...groupCategories.map(label=>({type:'Pôle',label,mode:'category',group:label})),...mapFamilies().map(label=>({type:'Famille',label,mode:'software',group:label})),...names.map(label=>({type:'Logiciel',label,mode:'software',group:mapFamilies().find(family=>companies.some(c=>mapTools(c,family).includes(label)))})),...companies.map(c=>({type:'Entreprise',label:c.nom_complet,siren:c.siren,category:mapCategory(c)}))].filter(option=>option.label.toLocaleLowerCase('fr').includes(query)).slice(0,9);
  panel.innerHTML=options.length?options.map((option,index)=>`<button type="button" role="option" data-map-result="${index}">${esc(option.label)}<small>${esc(option.type)}${option.siren?' · '+esc(option.siren):''}</small></button>`).join(''):'<div class="map-empty">Aucun résultat</div>';
  panel.hidden=false;input.setAttribute('aria-expanded','true');
  panel.querySelectorAll('[data-map-result]').forEach(button=>button.addEventListener('click',()=>{const option=options[Number(button.dataset.mapResult)];input.value='';mapMode=option.mode||'category';mapGroup=option.group||option.category;mapSoftware=option.type==='Logiciel'?option.label:null;mapCompany=option.siren||null;if(option.siren&&option.type==='Entreprise')mapCompany=option.siren;panel.hidden=true;input.setAttribute('aria-expanded','false');renderMap()}));
}
function setupCustomSelect(selectId,inputId){
  const select=document.getElementById(selectId),input=document.getElementById(inputId),label=input.closest('label');
  const update=()=>{label.hidden=select.value!=='other';input.required=select.value==='other'};
  select.addEventListener('change',update);update();
}
function renderOtherSoftwareList(siren){
  const list=otherSoftware({siren});
  document.getElementById('otherSoftwareList').innerHTML=list.length?list.map((item,index)=>`<div class="software-row"><span><b>${esc(item.name)}</b><small>${esc(item.type)}</small></span><button class="icon-btn" type="button" data-software-remove="${index}" aria-label="Retirer ${esc(item.name)}">×</button></div>`).join(''):'<div class="empty-inline">Aucun autre logiciel renseigné.</div>';
  document.querySelectorAll('[data-software-remove]').forEach(button=>button.addEventListener('click',()=>{const saved=getInternal(siren),updated=[...otherSoftware({siren})];updated.splice(Number(button.dataset.softwareRemove),1);internal[siren]={...saved,otherSoftware:updated};saveInternal();renderMapSampleNotice({siren});renderOtherSoftwareList(siren);renderCompanies();renderMap()}));
}
function renderCompanyKpis(siren){
  const list=(getInternal(siren).kpis||[]); document.getElementById('companyKpiList').innerHTML=list.length?list.map((k,i)=>`<div class="kpi-row"><span><b>${esc(k.name)}</b><small>${esc(k.comment||'')}</small></span><b>${esc(k.value)} ${esc(k.unit)}</b><span>Obj. ${esc(k.target)} ${esc(k.unit)}</span><span class="badge ${Number(k.value)>=Number(k.target)?'green':'orange'}">${Number(k.value)>=Number(k.target)?'Atteint':'À suivre'}</span><button class="icon-btn" data-kpi-remove="${i}">×</button></div>`).join(''):`<div class="empty-inline">Aucun KPI personnalisé. Ajoutez-en pour illustrer le suivi métier.</div>`;
  document.querySelectorAll('[data-kpi-remove]').forEach(b=>b.addEventListener('click',()=>{const old=getInternal(siren),k=[...(old.kpis||[])];k.splice(Number(b.dataset.kpiRemove),1);internal[siren]={...old,kpis:k};saveInternal();renderCompanyKpis(siren);renderMap();}));
}
function openKpiModal(targets){kpiTargets=Array.isArray(targets)?targets:[targets];document.getElementById('kpiModalContext').textContent=kpiTargets.length===1?'Ce KPI sera ajouté à une entreprise.':`Ce KPI sera ajouté à ${kpiTargets.length} entreprises sélectionnées.`;document.getElementById('kpiModalOverlay').classList.add('open')}
function closeKpiModal(){document.getElementById('kpiModalOverlay').classList.remove('open');document.getElementById('kpiForm').reset()}

function setupGlobal(){
  document.getElementById('drawerClose').addEventListener('click',closeDrawer); document.getElementById('drawerOverlay').addEventListener('click',closeDrawer);
  document.getElementById('kpiModalClose').addEventListener('click',closeKpiModal); document.getElementById('kpiCancel').addEventListener('click',closeKpiModal);
  document.getElementById('kpiForm').addEventListener('submit',e=>{e.preventDefault();const kpi={name:document.getElementById('kpiName').value.trim(),unit:document.getElementById('kpiUnit').value,value:document.getElementById('kpiValue').value,target:document.getElementById('kpiTarget').value,comment:document.getElementById('kpiComment').value.trim()};kpiTargets.forEach(siren=>{const old=getInternal(siren);internal[siren]={...old,kpis:[...(old.kpis||[]),{...kpi}]}});saveInternal();const currentSiren=currentCompany?.siren;closeKpiModal();if(currentSiren&&kpiTargets.includes(currentSiren))renderCompanyKpis(currentSiren);selectedCompanies.clear();renderCompanies();renderMap();});
  document.getElementById('performanceFilter').addEventListener('change',renderPerformance);
  document.getElementById('mapSearch').addEventListener('input',()=>{mapGroup=null;mapSoftware=null;mapCompany=null;renderMap();renderMapSearchResults()});
  document.getElementById('mapSearch').addEventListener('keydown',event=>{if(event.key==='Escape'){document.getElementById('mapSearchResults').hidden=true;event.currentTarget.setAttribute('aria-expanded','false')}if(event.key==='Enter'){const first=document.querySelector('[data-map-result]');if(first){event.preventDefault();first.click()}}});
  document.addEventListener('click',event=>{if(!event.target.closest('.map-search-wrap')){document.getElementById('mapSearchResults').hidden=true;document.getElementById('mapSearch').setAttribute('aria-expanded','false')}});
  document.querySelectorAll('[data-map-mode]').forEach(button=>button.addEventListener('click',()=>{mapMode=button.dataset.mapMode;mapGroup=null;mapSoftware=null;mapCompany=null;document.getElementById('mapSearch').value='';renderMap()}));
  document.getElementById('mapSampleToggle').addEventListener('change',event=>{showMapSamples=event.target.checked;mapGroup=null;mapSoftware=null;mapCompany=null;renderMap();renderConnections();renderOverview()});
  window.addEventListener('resize',mapDrawLinks);
  document.getElementById('exportBtn').addEventListener('click',()=>{const payload=companies.map(c=>({...c,simulation:simulatedFinance(c),internal:getInternal(c.siren)}));const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='groupe-parfait-demo-enrichie.json';a.click();URL.revokeObjectURL(a.href);});
}
function closeDrawer(){document.getElementById('drawerOverlay').classList.remove('open');document.getElementById('companyDrawer').classList.remove('open')}

setupNav(); setupCompanyFilters(); setupGlobal(); setupConnections(); renderOverview(); renderPerformance(); renderMap(); renderConnections();
