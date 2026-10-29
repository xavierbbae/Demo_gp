const COMPANY_CONNECTIONS_KEY = 'parfait_company_connections_v1';
const connectionCatalog = [
  {name:'Sage', logo:'S', description:'Écritures, balances et journaux'},
  {name:'Cegid', logo:'C', description:'Comptabilité et gestion multi-entités'},
  {name:'Pennylane', logo:'P', description:'Facturation, banque et comptabilité'},
  {name:'EBP', logo:'E', description:'Comptabilité et gestion pour PME'},
  {name:'Odoo', logo:'O', description:'ERP et comptabilité intégrée'},
  {name:'SAP', logo:'SA', description:'ERP et finance de groupe'},
  {name:'Oracle NetSuite', logo:'N', description:'ERP et consolidation financière'},
  {name:'Microsoft Dynamics', logo:'D', description:'Gestion financière et ERP'},
  {name:'QuickBooks', logo:'Q', description:'Comptabilité et facturation'},
  {name:'ACD', logo:'A', description:'Production comptable'}
];
const connectionDemoExamples = {'338539232':8, '451369318':32};
let selectedConnectionSiren = null;
let selectedConnectionTool = '';

function loadCompanyConnections() {
  try {
    const value = JSON.parse(localStorage.getItem(COMPANY_CONNECTIONS_KEY));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
function saveCompanyConnections(value) { localStorage.setItem(COMPANY_CONNECTIONS_KEY, JSON.stringify(value)); }
function clearConnectionRecord(siren) {
  const connections = loadCompanyConnections();
  if (!Object.hasOwn(connections, siren)) return;
  delete connections[siren];
  saveCompanyConnections(connections);
}
function companyConnectionProfile(company) {
  const saved = getInternal(company.siren);
  const hasSavedSoftware = Object.hasOwn(saved, 'accountingSoftware');
  const sample = hasSavedSoftware ? null : mapSample(company);
  const software = hasSavedSoftware ? accountingSoftware(company) : sample?.accounting || '';
  const record = loadCompanyConnections()[company.siren];
  const matchingRecord = record?.software === software ? record : null;
  const seededDemo = !hasSavedSoftware && sample && connectionDemoExamples[company.siren] && !matchingRecord;
  const connected = matchingRecord ? Boolean(matchingRecord.connected) : Boolean(seededDemo);
  const syncedAt = matchingRecord?.syncedAt || (seededDemo ? new Date(Date.now() - connectionDemoExamples[company.siren] * 60000).toISOString() : null);
  return {software, source: hasSavedSoftware ? 'saved' : sample ? 'sample' : 'missing', connected, syncedAt};
}
function connectionCount() { return companies.filter(company => companyConnectionProfile(company).connected).length; }
function connectionDateLabel(value) {
  if (!value) return 'Jamais';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Jamais' : date.toLocaleString('fr-FR', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
}
function connectionStatusLabel(profile) {
  return profile.connected ? 'Connectée · démo' : profile.software ? 'À connecter' : 'Non renseigné';
}
function connectionStatusClass(profile) { return profile.connected ? 'connected' : profile.software ? 'pending' : 'missing'; }
function connectionTools() {
  const known = new Set(connectionCatalog.map(tool => tool.name));
  const extra = [...new Set(companies.map(company => companyConnectionProfile(company).software).filter(name => name && !known.has(name)))].sort((left, right) => left.localeCompare(right, 'fr'));
  return [...connectionCatalog, ...extra.map(name => ({name, logo: name.slice(0, 2).toUpperCase(), description:'Logiciel ajouté dans le référentiel'}))];
}
function renderConnectionCatalog() {
  const profiles = companies.map(company => companyConnectionProfile(company));
  document.getElementById('connectionsGrid').innerHTML = connectionTools().map(tool => {
    const users = profiles.filter(profile => profile.software === tool.name);
    const connected = users.filter(profile => profile.connected).length;
    return `<button type="button" class="accounting-tool-card ${selectedConnectionTool === tool.name ? 'active' : ''}" data-connection-tool="${esc(tool.name)}" aria-pressed="${selectedConnectionTool === tool.name}"><span class="accounting-tool-card-top"><span class="accounting-tool-mark">${esc(tool.logo)}</span><strong>${esc(tool.name)}</strong></span><small>${esc(tool.description)}</small><span class="accounting-tool-card-footer"><span>${users.length} entreprise${users.length > 1 ? 's' : ''}</span><b>${connected} en démo ›</b></span></button>`;
  }).join('');
  document.getElementById('connectionResetTool').hidden = !selectedConnectionTool;
}
function renderConnectionSummary() {
  const profiles = companies.map(company => companyConnectionProfile(company));
  const connected = profiles.filter(profile => profile.connected).length;
  const pending = profiles.filter(profile => profile.software && !profile.connected).length;
  const missing = profiles.filter(profile => !profile.software).length;
  document.getElementById('connectionSummary').innerHTML = `<div><b>${companies.length}</b><span>entreprises suivies</span></div><div><b>${connected}</b><span>connexions simulées</span></div><div><b>${pending}</b><span>logiciels indiqués, à connecter</span></div><div><b>${missing}</b><span>logiciels non renseignés</span></div>`;
}
function connectionFilteredCompanies() {
  const query = document.getElementById('connectionSearch').value.trim().toLocaleLowerCase('fr');
  const filter = document.getElementById('connectionStatusFilter').value;
  return companies.filter(company => {
    const profile = companyConnectionProfile(company);
    const matchesSearch = !query || [company.nom_complet, company.siren, company.ville, groupCategory(company), profile.software].join(' ').toLocaleLowerCase('fr').includes(query);
    const matchesStatus = filter === 'all' || (filter === 'connected' && profile.connected) || (filter === 'pending' && profile.software && !profile.connected) || (filter === 'missing' && !profile.software);
    return matchesSearch && matchesStatus && (!selectedConnectionTool || profile.software === selectedConnectionTool);
  }).sort((left, right) => {
    const leftProfile = companyConnectionProfile(left), rightProfile = companyConnectionProfile(right);
    const rank = profile => profile.connected ? 0 : profile.software ? 1 : 2;
    return rank(leftProfile) - rank(rightProfile) || left.nom_complet.localeCompare(right.nom_complet, 'fr');
  });
}
function renderConnectionCompanies(list) {
  document.getElementById('connectionResultCount').textContent = `${list.length} / ${companies.length} sociétés`;
  document.getElementById('connectionCompanyList').innerHTML = list.length ? list.map(company => {
    const profile = companyConnectionProfile(company);
    const subtitle = profile.software ? `${profile.software}${profile.source === 'sample' ? ' · exemple fictif' : ''}` : 'Logiciel non renseigné';
    return `<button type="button" class="company-connection-row ${selectedConnectionSiren === company.siren ? 'active' : ''}" data-connection-company="${company.siren}" aria-pressed="${selectedConnectionSiren === company.siren}"><span class="company-connection-monogram">${esc(company.nom_complet.slice(0, 2).toUpperCase())}</span><span class="company-connection-main"><strong>${esc(company.nom_complet)}</strong><small>${esc(company.siren)} · ${esc(subtitle)}</small></span><span class="company-connection-side"><span class="connection-badge ${connectionStatusClass(profile)}">${connectionStatusLabel(profile)}</span><small>Dernière synchro : ${esc(connectionDateLabel(profile.syncedAt))}</small></span></button>`;
  }).join('') : '<div class="connection-empty"><b>Aucune entreprise trouvée</b>Modifiez la recherche ou les filtres.</div>';
}
function connectionSoftwareOptions(profile) {
  const names = [...new Set([...accountingSoftwareOptions, ...(profile.software && !accountingSoftwareOptions.includes(profile.software) ? [profile.software] : [])])];
  return `<option value="">Non renseigné</option>${names.map(name => `<option value="${esc(name)}" ${profile.software === name ? 'selected' : ''}>${esc(name)}</option>`).join('')}<option value="__other__">Autre logiciel…</option>`;
}
function renderConnectionDetail(company) {
  if (!company) {
    document.getElementById('connectionDetail').innerHTML = '<div class="connection-empty"><b>Choisissez une entreprise</b>Sa fiche comptable apparaîtra ici.</div>';
    return;
  }
  const profile = companyConnectionProfile(company);
  const source = profile.source === 'sample' ? '<span class="connection-software-source">Logiciel fictif de l’échantillon · à confirmer</span>' : profile.software ? '<span class="connection-software-source">Renseigné dans la fiche entreprise</span>' : '';
  document.getElementById('connectionDetail').innerHTML = `<div class="connection-detail-head"><p class="eyebrow">FICHE DE CONNEXION</p><h3>${esc(company.nom_complet)}</h3><p>SIREN ${esc(company.siren)} · ${esc(groupCategory(company) || 'À classer')} · ${esc(company.ville || 'Ville non renseignée')}</p><span class="connection-badge ${connectionStatusClass(profile)}">${connectionStatusLabel(profile)}</span></div><div class="connection-detail-body"><div class="connection-detail-section"><h4>Logiciel comptable</h4><p>Cette valeur est partagée avec les onglets Entreprises et Cartographie.</p>${source}<form class="connection-software-form" id="connectionSoftwareForm"><label>Logiciel utilisé<select id="connectionSoftwareSelect">${connectionSoftwareOptions(profile)}</select></label><label id="connectionCustomLabel" hidden>Nom du logiciel<input id="connectionCustomSoftware" maxlength="80" placeholder="Saisir le nom du logiciel" /></label><button type="submit" class="btn ghost">Enregistrer le logiciel</button><span id="connectionFormStatus" class="connection-form-status" role="status"></span></form></div><div class="connection-detail-section"><h4>Connexion et synchronisation</h4><p>Simulation locale pour illustrer l’état de chaque entreprise, sans accès au logiciel réel.</p><div class="connection-sync-card"><div class="connection-sync-card-top"><strong>${esc(profile.software || 'Aucun outil sélectionné')}</strong><span class="connection-badge ${connectionStatusClass(profile)}">${connectionStatusLabel(profile)}</span></div><div class="connection-sync-time"><span aria-hidden="true">↻</span><span>Dernière synchronisation simulée<br><b>${esc(connectionDateLabel(profile.syncedAt))}</b></span></div><div class="connection-sync-actions">${profile.connected ? `<button class="btn ghost" type="button" data-connection-sync="${company.siren}">Actualiser la simulation</button><button class="btn ghost" type="button" data-connection-disconnect="${company.siren}">Déconnecter</button>` : `<button class="btn primary" type="button" data-connection-connect="${company.siren}" ${profile.software ? '' : 'disabled'}>Connecter (démo)</button>`}</div><p>${profile.source === 'sample' ? 'Cette affectation provient d’un exemple fictif, non de la fiche réelle.' : 'La connexion affichée ici ne récupère aucune donnée comptable réelle.'}</p></div></div><div class="connection-detail-section"><h4>Données à synchroniser en production</h4><div class="connection-data-preview"><div><b>CA</b><span>Flux comptable</span></div><div><b>Résultat</b><span>Compte de résultat</span></div><div><b>Trésorerie</b><span>Banque et comptabilité</span></div></div></div></div>`;
}
function renderConnections() {
  renderConnectionSummary();
  renderConnectionCatalog();
  const list = connectionFilteredCompanies();
  if (!list.some(company => company.siren === selectedConnectionSiren)) selectedConnectionSiren = list[0]?.siren || null;
  renderConnectionCompanies(list);
  renderConnectionDetail(list.find(company => company.siren === selectedConnectionSiren));
}
function keepConnectionVisible(siren) {
  selectedConnectionSiren = siren;
  if (connectionFilteredCompanies().some(company => company.siren === siren)) return;
  document.getElementById('connectionStatusFilter').value = 'all';
  document.getElementById('connectionSearch').value = '';
  selectedConnectionTool = '';
}
function updateConnectionStatus(siren, connected) {
  const company = companies.find(item => item.siren === siren);
  if (!company) return;
  const profile = companyConnectionProfile(company);
  if (!profile.software) return;
  const connections = loadCompanyConnections();
  connections[siren] = {software: profile.software, connected, syncedAt: connected ? new Date().toISOString() : profile.syncedAt};
  saveCompanyConnections(connections);
  keepConnectionVisible(siren);
  renderConnections();
  renderOverview();
}
function setupConnections() {
  document.getElementById('connectionSearch').addEventListener('input', renderConnections);
  document.getElementById('connectionStatusFilter').addEventListener('change', renderConnections);
  document.getElementById('connectionsGrid').addEventListener('click', event => {
    const button = event.target.closest('[data-connection-tool]');
    if (!button) return;
    selectedConnectionTool = selectedConnectionTool === button.dataset.connectionTool ? '' : button.dataset.connectionTool;
    renderConnections();
  });
  document.getElementById('connectionResetTool').addEventListener('click', () => {selectedConnectionTool = ''; renderConnections();});
  document.getElementById('connectionCompanyList').addEventListener('click', event => {
    const button = event.target.closest('[data-connection-company]');
    if (!button) return;
    selectedConnectionSiren = button.dataset.connectionCompany;
    renderConnections();
  });
  document.getElementById('connectionDetail').addEventListener('change', event => {
    if (event.target.id !== 'connectionSoftwareSelect') return;
    const custom = event.target.value === '__other__';
    document.getElementById('connectionCustomLabel').hidden = !custom;
    document.getElementById('connectionCustomSoftware').required = custom;
  });
  document.getElementById('connectionDetail').addEventListener('submit', event => {
    if (event.target.id !== 'connectionSoftwareForm') return;
    event.preventDefault();
    const company = companies.find(item => item.siren === selectedConnectionSiren);
    if (!company) return;
    const selected = document.getElementById('connectionSoftwareSelect').value;
    const nextSoftware = selected === '__other__' ? document.getElementById('connectionCustomSoftware').value.trim() : selected;
    if (selected === '__other__' && !nextSoftware) return;
    const previous = accountingSoftware(company);
    const hadSavedSoftware = Object.hasOwn(getInternal(company.siren), 'accountingSoftware');
    internal[company.siren] = {...getInternal(company.siren), accountingSoftware: nextSoftware};
    if (previous !== nextSoftware || !hadSavedSoftware) clearConnectionRecord(company.siren);
    saveInternal();
    keepConnectionVisible(company.siren);
    renderCompanies(); renderMap(); renderOverview(); renderConnections();
    document.getElementById('connectionFormStatus').textContent = 'Logiciel enregistré dans le référentiel.';
  });
  document.getElementById('connectionDetail').addEventListener('click', event => {
    const connect = event.target.closest('[data-connection-connect]');
    const disconnect = event.target.closest('[data-connection-disconnect]');
    const sync = event.target.closest('[data-connection-sync]');
    if (connect) updateConnectionStatus(connect.dataset.connectionConnect, true);
    else if (disconnect) updateConnectionStatus(disconnect.dataset.connectionDisconnect, false);
    else if (sync) updateConnectionStatus(sync.dataset.connectionSync, true);
  });
}
