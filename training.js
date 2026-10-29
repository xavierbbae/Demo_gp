const TRAINING_DEMO_KEY = 'parfait_training_demo_v1';
const trainingFutureDate = new Date(Date.now() + 14 * 86400000).toLocaleDateString('sv-SE');
const trainingPeople = [
  ['Camille', 'Martin'], ['Léa', 'Durand'], ['Hugo', 'Bernard'], ['Inès', 'Laurent'],
  ['Nolan', 'Petit'], ['Sarah', 'Moreau'], ['Adam', 'Roux'], ['Emma', 'Fontaine']
];
const trainingExamples = [
  {
    id: 'demo-pilotage-financier', title: 'Piloter les KPI et le CA par société', companySiren: '338539232',
    dates: ['2026-09-15', '2026-09-16'], completed: true, topic: 'finance',
    questions: [
      {id: 'satisfaction', label: 'Êtes-vous satisfait de cette formation ?', kind: 'satisfaction'},
      {id: 'comprehension', label: 'Comprenez-vous mieux les indicateurs CA et résultat ?', kind: 'objective'},
      {id: 'autonomie', label: 'Pouvez-vous consulter seul les KPI de votre société ?', kind: 'objective'}
    ],
    ratings: [[5, 5, 4], [4, 4, 4], [5, 5, 5], [4, 4, 3], [5, 4, 4], [4, 5, 4], [5, 5, 5]],
    attendance: [true, true, true, true, true, true, true, false]
  },
  {
    id: 'demo-automobile', title: 'Maîtriser le suivi du pôle Automobile', companySiren: '488308198',
    dates: ['2026-09-28'], completed: true, topic: 'automobile',
    questions: [
      {id: 'satisfaction', label: 'Êtes-vous satisfait de cette formation ?', kind: 'satisfaction'},
      {id: 'comprehension', label: 'Comprenez-vous le tableau de bord des ventes et marges ?', kind: 'objective'},
      {id: 'autonomie', label: 'Savez-vous créer et suivre un KPI pour votre équipe ?', kind: 'objective'}
    ],
    ratings: [[5, 4, 4], [4, 4, 3], [4, 5, 4], [5, 5, 5], [3, 3, 3], [4, 4, 4]],
    attendance: [true, true, true, true, true, true, false, false]
  },
  {
    id: 'demo-alimentaire', title: 'Suivre les stocks et la performance Alimentaire', companySiren: '451369318',
    dates: ['2026-10-07', '2026-10-08'], completed: true, topic: 'alimentaire',
    questions: [
      {id: 'satisfaction', label: 'Êtes-vous satisfait de cette formation ?', kind: 'satisfaction'},
      {id: 'comprehension', label: 'Comprenez-vous le suivi des stocks et des ruptures ?', kind: 'objective'},
      {id: 'autonomie', label: 'Pouvez-vous utiliser le module de gestion commerciale ?', kind: 'objective'}
    ],
    ratings: [[5, 5, 4], [5, 4, 5], [4, 4, 4], [5, 5, 5], [4, 3, 4], [4, 4, 3], [5, 5, 4]],
    attendance: [true, true, true, true, true, true, true, true]
  },
  {
    id: 'demo-industrie-a-venir', title: 'Découvrir le pilotage du pôle Industrie', companySiren: '510498264',
    dates: [trainingFutureDate], completed: false, topic: 'industrie',
    questions: [
      {id: 'satisfaction', label: 'Êtes-vous satisfait de cette formation ?', kind: 'satisfaction'},
      {id: 'comprehension', label: 'Comprenez-vous les indicateurs de production ?', kind: 'objective'},
      {id: 'autonomie', label: 'Pouvez-vous consulter les KPI de votre société ?', kind: 'objective'}
    ],
    ratings: [], attendance: [false, false, false, false, false, false, false, false]
  }
];
let trainingTab = 'active';
let selectedTrainingId = null;

function loadTrainings() {
  try {
    const value = JSON.parse(localStorage.getItem(TRAININGS_KEY));
    return Array.isArray(value) ? value.filter(item => item && item.id && item.title) : [];
  } catch { return []; }
}
function loadTrainingDemoState() {
  try {
    const value = JSON.parse(localStorage.getItem(TRAINING_DEMO_KEY));
    return value && typeof value === 'object' ? value : {};
  } catch { return {}; }
}
function saveTrainingDemoState(state) { localStorage.setItem(TRAINING_DEMO_KEY, JSON.stringify(state)); }
function trainingStateFor(training) { return loadTrainingDemoState()[training.id] || {}; }
function trainingCompanyName(training) {
  return companies.find(company => company.siren === training.companySiren)?.nom_complet || 'Entreprise non précisée';
}
function trainingDateLabel(training) {
  const dates = Array.isArray(training.dates) ? training.dates.filter(Boolean) : [];
  if (!dates.length) return 'Date non précisée';
  const format = value => new Date(value + 'T12:00:00').toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'});
  return dates.length > 1 ? `Du ${format(dates[0])} au ${format(dates[dates.length - 1])}` : format(dates[0]);
}
function trainingIsHistory(training) {
  if (training.completed) return true;
  const end = training.dates?.[training.dates.length - 1];
  return Boolean(end && end < new Date().toLocaleDateString('sv-SE'));
}
function trainingParticipants(training) {
  const seeded = training.sample ? trainingPeople.map(([firstName, lastName], index) => ({
    id: `seed-${index}`, firstName, lastName, email: `${firstName}.${lastName}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() + '@example.com',
    present: Boolean(training.attendance[index])
  })) : [];
  const added = trainingStateFor(training).participants;
  return [...seeded, ...(Array.isArray(added) ? added : [])];
}
function trainingQuestions(training) {
  const added = trainingStateFor(training).questions;
  return [...training.questions, ...(Array.isArray(added) ? added : [])];
}
function trainingResponses(training) {
  const seeded = training.ratings.map((scores, index) => ({
    id: `response-seed-${index}`, answers: Object.fromEntries(training.questions.map((question, questionIndex) => [question.id, scores[questionIndex]]))
  }));
  const added = trainingStateFor(training).responses;
  return [...seeded, ...(Array.isArray(added) ? added : [])];
}
function trainingAttendance(training, participant) {
  const saved = trainingStateFor(training).attendance || {};
  return Object.hasOwn(saved, participant.id) ? Boolean(saved[participant.id]) : Boolean(participant.present);
}
function trainingUrl(training) {
  const url = new URL('inscription.html', location.href);
  url.searchParams.set('id', training.id);
  url.searchParams.set('formation', training.title);
  url.searchParams.set('societe', trainingCompanyName(training));
  url.searchParams.set('dates', trainingDateLabel(training));
  if (training.sample) url.searchParams.set('demo', '1');
  else url.searchParams.set('destinataire', training.email || DEFAULT_TRAINING_EMAIL);
  return url.href;
}
function trainingEvaluationUrl(training) {
  const url = new URL('evaluation.html', location.href);
  url.searchParams.set('id', training.id);
  url.searchParams.set('formation', training.title);
  url.searchParams.set('questions', JSON.stringify(trainingQuestions(training)));
  return url.href;
}
function trainingSupportUrl(training) {
  const url = new URL('support-formation.html', location.href);
  url.searchParams.set('module', training.topic);
  return url.href;
}
function trainingAll() {
  return [...trainingExamples.map(training => ({...training, sample: true})), ...loadTrainings().map(training => ({...training, sample: false}))];
}
function trainingListItem(training) {
  const selected = training.id === selectedTrainingId;
  const participants = training.sample ? `${trainingParticipants(training).length} inscrits` : 'Suivi réservé à la version complète';
  return `<button type="button" class="training-list-item ${selected ? 'active' : ''}" data-training-open="${esc(training.id)}" aria-pressed="${selected}"><span class="training-list-item-top"><span class="training-status ${trainingIsHistory(training) ? 'done' : 'upcoming'}">${trainingIsHistory(training) ? 'Terminée' : 'En cours / à venir'}</span>${training.sample ? '<span class="training-demo-badge">EXEMPLE</span>' : '<span class="training-test-badge">TEST</span>'}</span><strong>${esc(training.title)}</strong><small>${esc(trainingCompanyName(training))}</small><span class="training-list-item-footer"><span>${esc(trainingDateLabel(training))}</span><b>${esc(participants)} ›</b></span></button>`;
}
function trainingOverview(training) {
  const participants = trainingParticipants(training);
  const present = participants.filter(participant => trainingAttendance(training, participant)).length;
  const answers = trainingResponses(training).length;
  return `<div class="training-overview"><div><b>${participants.length}</b><span>inscrits</span></div><div><b>${present}</b><span>présents</span></div><div><b>${answers}</b><span>réponses</span></div></div>`;
}
function trainingSupportList(training) {
  const uploaded = trainingStateFor(training).files || [];
  return `<div class="training-support-list"><a href="${esc(trainingSupportUrl(training))}" target="_blank" rel="noopener">▤ Guide pédagogique · ${esc(training.title)} <span>Ouvrir ↗</span></a>${uploaded.map(file => {
    const safeUrl = /^data:(application\/pdf|image\/png|image\/jpeg|text\/plain);base64,[A-Za-z0-9+/=]+$/.test(file.data) ? file.data : '';
    return safeUrl ? `<a href="${esc(safeUrl)}" download="${esc(file.name)}">▤ ${esc(file.name)} <span>Télécharger ↓</span></a>` : '';
  }).join('')}</div><label class="training-upload-label">Ajouter un support (PDF, image ou texte · 1 Mo max)<input type="file" id="trainingSupportFile" accept=".pdf,.png,.jpg,.jpeg,.txt,application/pdf,image/png,image/jpeg,text/plain" /></label><p id="trainingUploadMessage" class="training-inline-message" role="status"></p>`;
}
function trainingAttendanceList(training) {
  return `<div class="training-attendance-list">${trainingParticipants(training).map(participant => `<label><input type="checkbox" data-training-attendance="${esc(participant.id)}" ${trainingAttendance(training, participant) ? 'checked' : ''} /><span><b>${esc(participant.firstName)} ${esc(participant.lastName)}</b><small>${esc(participant.email)}</small></span><em>${trainingAttendance(training, participant) ? 'Présent' : 'Absent / à confirmer'}</em></label>`).join('')}</div>`;
}
function trainingQuestionStats(training) {
  const responses = trainingResponses(training);
  const questions = trainingQuestions(training);
  const satisfactionId = questions.find(question => question.kind === 'satisfaction')?.id;
  const satisfactionValues = responses.map(response => Number(response.answers?.[satisfactionId])).filter(value => value >= 1 && value <= 5);
  const objectiveIds = questions.filter(question => question.kind === 'objective').map(question => question.id);
  const objectiveValues = responses.flatMap(response => objectiveIds.map(id => Number(response.answers?.[id]))).filter(value => value >= 1 && value <= 5);
  const satisfaction = satisfactionValues.length ? Math.round(satisfactionValues.filter(value => value >= 4).length / satisfactionValues.length * 100) : 0;
  const objectives = objectiveValues.length ? Math.round(objectiveValues.filter(value => value >= 4).length / objectiveValues.length * 100) : 0;
  return `<div class="training-impact-grid"><div><b>${satisfactionValues.length ? satisfaction + ' %' : '—'}</b><span>taux de satisfaction<br><small>note ≥ 4 / 5</small></span></div><div><b>${objectiveValues.length ? objectives + ' %' : '—'}</b><span>objectifs compris<br><small>réponses ≥ 4 / 5</small></span></div><div><b>${responses.length}</b><span>questionnaires reçus<br><small>exemples + tests locaux</small></span></div></div><div class="training-chart-list">${questions.map(question => {
    const values = responses.map(response => Number(response.answers?.[question.id])).filter(value => value >= 1 && value <= 5);
    const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    return `<div class="training-chart-row"><div><b>${esc(question.label)}</b><span>${values.length ? average.toLocaleString('fr-FR', {maximumFractionDigits: 1}) + ' / 5' : 'En attente'}</span></div><div class="training-chart-track"><span style="width:${average / 5 * 100}%"></span></div><small>${values.length} réponse${values.length > 1 ? 's' : ''}</small></div>`;
  }).join('')}</div>`;
}
function trainingSampleDetail(training) {
  const questions = trainingQuestions(training);
  const emailHref = 'mailto:?subject=' + encodeURIComponent('Questionnaire de formation : ' + training.title) + '&body=' + encodeURIComponent('Bonjour,\n\nMerci de répondre au questionnaire : ' + trainingEvaluationUrl(training));
  return `<div class="training-detail-head"><span class="training-demo-badge">PARCOURS D’EXEMPLE COMPLET</span><h3>${esc(training.title)}</h3><p>${esc(trainingCompanyName(training))} · ${esc(trainingDateLabel(training))}</p>${trainingOverview(training)}</div>
    <div class="training-step"><div class="training-step-heading"><span>01</span><div><h4>Inscription</h4><p>Partagez le formulaire et suivez les inscrits sur cet appareil.</p></div></div><div class="training-link-line"><input readonly id="trainingRegistrationLink" aria-label="Lien d’inscription" value="${esc(trainingUrl(training))}" /><button class="btn ghost" type="button" data-training-copy="registration">Copier</button><a class="btn ghost" href="${esc(trainingUrl(training))}" target="_blank" rel="noopener">Ouvrir ↗</a></div><p class="training-inline-message">Les participants d’exemple sont fictifs. Un test effectué sur ce même navigateur s’ajoute au compteur.</p></div>
    <div class="training-step"><div class="training-step-heading"><span>02</span><div><h4>Supports du jour</h4><p>Consultez le guide et ajoutez un document pour la démonstration.</p></div></div>${trainingSupportList(training)}</div>
    <div class="training-step"><div class="training-step-heading"><span>03</span><div><h4>Feuille de présence</h4><p>Cochez les participants présents ; le bilan se recalcule immédiatement.</p></div></div>${trainingAttendanceList(training)}</div>
    <div class="training-step"><div class="training-step-heading"><span>04</span><div><h4>Questionnaire et impact</h4><p>Questions personnalisées, lien à partager et résultats en graphiques.</p></div></div><div class="training-link-line"><input readonly id="trainingEvaluationLink" aria-label="Lien du questionnaire" value="${esc(trainingEvaluationUrl(training))}" /><button class="btn ghost" type="button" data-training-copy="evaluation">Copier</button><a class="btn ghost" href="${esc(trainingEvaluationUrl(training))}" target="_blank" rel="noopener">Ouvrir ↗</a></div><a class="training-email-link" href="${esc(emailHref)}">Préparer l’envoi par e-mail ↗</a><div class="training-question-list">${questions.map(question => `<div><span>${esc(question.label)}</span><small>${question.kind === 'satisfaction' ? 'Satisfaction' : 'Objectif pédagogique'}</small></div>`).join('')}</div><form id="trainingQuestionForm" class="training-question-form"><label>Ajouter une question personnalisée<input id="trainingQuestionLabel" required maxlength="140" placeholder="Ex. Savez-vous utiliser le module de reporting ?" /></label><label>Type<select id="trainingQuestionKind"><option value="objective">Objectif pédagogique</option><option value="satisfaction">Satisfaction</option></select></label><button class="btn ghost" type="submit">+ Ajouter</button></form><p class="training-inline-message">Les réponses au lien sont visibles ici uniquement si le questionnaire est rempli sur ce même navigateur.</p>${trainingQuestionStats(training)}</div>`;
}
function trainingLockedDetail(training) {
  return `<div class="training-detail-head"><span class="training-test-badge">FORMATION TEST</span><h3>${esc(training.title)}</h3><p>${esc(trainingCompanyName(training))} · ${esc(trainingDateLabel(training))}</p></div><div class="training-step"><div class="training-step-heading"><span>01</span><div><h4>Formulaire d’inscription</h4><p>Lien à partager ; réponses reçues par e-mail.</p></div></div><div class="training-link-line"><input readonly id="trainingRegistrationLink" aria-label="Lien d’inscription" value="${esc(trainingUrl(training))}" /><button class="btn ghost" type="button" data-training-copy="registration">Copier</button><a class="btn ghost" href="${esc(trainingUrl(training))}" target="_blank" rel="noopener">Ouvrir ↗</a></div><p class="training-inline-message">Les réponses sont envoyées à ${esc(training.email || DEFAULT_TRAINING_EMAIL)} via FormSubmit. Le compteur centralisé n’est pas disponible dans cette démo.</p></div><div class="training-locked"><div class="training-locked-preview" aria-hidden="true"><div class="training-step"><h4>02 · Supports du jour</h4><p>Guide pédagogique · Documents partagés</p></div><div class="training-step"><h4>03 · Feuille de présence</h4><p>Participants présents · Émargement</p></div><div class="training-step"><h4>04 · Questionnaire et impact</h4><p>Satisfaction 92 % · Objectifs atteints 86 %</p></div></div><div class="training-locked-message"><span>🔒</span><h4>Limite de la démo atteinte</h4><p>Pour débloquer les supports, le suivi des présences, les questionnaires et les graphiques d’impact de vos propres formations, contactez Xyma Partners.</p><a class="btn primary" href="mailto:xymapartners.contact@gmail.com?subject=Acc%C3%A8s%20au%20module%20Formations">Contacter Xyma Partners</a></div></div>`;
}
function renderTrainings() {
  const trainings = trainingAll();
  const active = trainings.filter(training => !trainingIsHistory(training));
  const history = trainings.filter(trainingIsHistory);
  const visible = trainingTab === 'history' ? history : active;
  if (!visible.some(training => training.id === selectedTrainingId)) selectedTrainingId = visible[0]?.id || null;
  const examples = trainings.filter(training => training.sample);
  const registrations = examples.reduce((total, training) => total + trainingParticipants(training).length, 0);
  const answers = examples.reduce((total, training) => total + trainingResponses(training).length, 0);
  document.getElementById('trainingSummary').innerHTML = `<div><b>${active.length}</b><span>en cours ou à venir</span></div><div><b>${history.length}</b><span>dans l’historique</span></div><div><b>${registrations}</b><span>inscriptions d’exemple</span></div><div><b>${answers}</b><span>questionnaires d’exemple</span></div>`;
  document.getElementById('trainingActiveCount').textContent = active.length;
  document.getElementById('trainingHistoryCount').textContent = history.length;
  document.querySelectorAll('[data-training-tab]').forEach(button => {
    const selected = button.dataset.trainingTab === trainingTab;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', selected);
  });
  document.getElementById('trainingList').innerHTML = visible.length ? visible.map(trainingListItem).join('') : '<div class="training-empty">Aucune formation dans cette rubrique.</div>';
  const training = visible.find(item => item.id === selectedTrainingId);
  document.getElementById('trainingDetail').innerHTML = training ? (training.sample ? trainingSampleDetail(training) : trainingLockedDetail(training)) : '<div class="training-empty">Sélectionnez ou créez une formation.</div>';
  document.getElementById('trainingDetail').dataset.trainingId = training?.id || '';
}
async function trainingCopy(value, button) {
  try { await navigator.clipboard.writeText(value); }
  catch {
    const input = button.parentElement.querySelector('input');
    input.select();
    document.execCommand('copy');
  }
  button.textContent = 'Copié ✓';
}
function setupTraining() {
  const companySelect = document.getElementById('trainingCompany');
  companySelect.innerHTML += companies.slice().sort((left, right) => left.nom_complet.localeCompare(right.nom_complet, 'fr')).map(company => `<option value="${esc(company.siren)}">${esc(company.nom_complet)}</option>`).join('');
  const createPanel = document.getElementById('trainingCreatePanel');
  document.getElementById('trainingCreateButton').addEventListener('click', () => {createPanel.hidden = false; document.getElementById('trainingTitle').focus();});
  document.getElementById('trainingCreateClose').addEventListener('click', () => {createPanel.hidden = true;});
  document.getElementById('trainingDateMode').addEventListener('change', event => {
    const period = event.target.value === 'period';
    document.getElementById('trainingEndLabel').hidden = !period;
    document.getElementById('trainingEnd').required = period;
  });
  document.getElementById('trainingForm').addEventListener('submit', event => {
    event.preventDefault();
    const title = document.getElementById('trainingTitle').value.trim();
    const companySiren = companySelect.value;
    const start = document.getElementById('trainingStart').value;
    const end = document.getElementById('trainingDateMode').value === 'period' ? document.getElementById('trainingEnd').value : start;
    const email = document.getElementById('trainingEmail').value.trim();
    if (!title || !companySiren || !start || !end || !email) return;
    if (end < start) {document.getElementById('trainingEnd').setCustomValidity('La fin doit être après le début.'); document.getElementById('trainingEnd').reportValidity(); return;}
    document.getElementById('trainingEnd').setCustomValidity('');
    const trainings = loadTrainings();
    const training = {id: crypto.randomUUID(), title, companySiren, dates: start === end ? [start] : [start, end], email};
    trainings.push(training);
    localStorage.setItem(TRAININGS_KEY, JSON.stringify(trainings));
    event.target.reset();
    document.getElementById('trainingEndLabel').hidden = true;
    document.getElementById('trainingEnd').required = false;
    createPanel.hidden = true;
    trainingTab = trainingIsHistory(training) ? 'history' : 'active';
    selectedTrainingId = training.id;
    renderTrainings();
  });
  document.getElementById('trainingEnd').addEventListener('input', event => event.target.setCustomValidity(''));
  document.querySelectorAll('[data-training-tab]').forEach(button => button.addEventListener('click', () => {trainingTab = button.dataset.trainingTab; selectedTrainingId = null; renderTrainings();}));
  document.getElementById('trainingList').addEventListener('click', event => {
    const button = event.target.closest('[data-training-open]');
    if (button) {selectedTrainingId = button.dataset.trainingOpen; renderTrainings();}
  });
  document.getElementById('trainingDetail').addEventListener('click', event => {
    const copy = event.target.closest('[data-training-copy]');
    if (copy) {
      const input = document.getElementById(copy.dataset.trainingCopy === 'evaluation' ? 'trainingEvaluationLink' : 'trainingRegistrationLink');
      if (input) trainingCopy(input.value, copy);
    }
  });
  document.getElementById('trainingDetail').addEventListener('change', async event => {
    const training = trainingExamples.find(item => item.id === selectedTrainingId);
    if (!training) return;
    const state = loadTrainingDemoState();
    const current = state[training.id] || {};
    if (event.target.matches('[data-training-attendance]')) {
      current.attendance = {...current.attendance, [event.target.dataset.trainingAttendance]: event.target.checked};
      state[training.id] = current; saveTrainingDemoState(state); renderTrainings();
    }
    if (event.target.id === 'trainingSupportFile') {
      const file = event.target.files[0];
      const message = document.getElementById('trainingUploadMessage');
      const accepted = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
      if (!file || !accepted.includes(file.type) || file.size > 1024 * 1024 || (current.files || []).length >= 3) {
        message.textContent = 'Choisissez un PDF, une image ou un texte de 1 Mo maximum (trois ajouts au plus).';
        return;
      }
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      current.files = [...(current.files || []), {name: file.name, data}];
      state[training.id] = current;
      try {saveTrainingDemoState(state); renderTrainings();}
      catch {message.textContent = 'Stockage local saturé. Essayez un fichier plus petit.';}
    }
  });
  document.getElementById('trainingDetail').addEventListener('submit', event => {
    if (event.target.id !== 'trainingQuestionForm') return;
    event.preventDefault();
    const training = trainingExamples.find(item => item.id === selectedTrainingId);
    if (!training) return;
    const label = document.getElementById('trainingQuestionLabel').value.trim();
    const kind = document.getElementById('trainingQuestionKind').value;
    if (!label || trainingQuestions(training).length >= 10) return;
    const state = loadTrainingDemoState();
    const current = state[training.id] || {};
    current.questions = [...(current.questions || []), {id: crypto.randomUUID(), label, kind}];
    state[training.id] = current;
    saveTrainingDemoState(state);
    renderTrainings();
  });
  window.addEventListener('storage', event => {
    if ([TRAINING_DEMO_KEY, TRAININGS_KEY].includes(event.key)) renderTrainings();
  });
  renderTrainings();
}

setupTraining();
