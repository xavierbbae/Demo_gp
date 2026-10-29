const evaluationParams = new URLSearchParams(location.search);
const evaluationId = evaluationParams.get('id');
const evaluationTitle = evaluationParams.get('formation');
const evaluationForm = document.getElementById('evaluationForm');
const evaluationMessage = document.getElementById('evaluationMessage');
let evaluationQuestions = [];

try {
  const parsed = JSON.parse(evaluationParams.get('questions') || '[]');
  if (Array.isArray(parsed) && parsed.length > 0 && parsed.length <= 10 && parsed.every(question => typeof question.id === 'string' && question.id.length <= 100 && typeof question.label === 'string' && question.label.length <= 140 && ['satisfaction', 'objective'].includes(question.kind))) evaluationQuestions = parsed;
} catch {}
document.getElementById('evaluationTitle').textContent = evaluationTitle || 'Formation indisponible';
if (!evaluationId?.startsWith('demo-') || evaluationId.length > 100 || !evaluationTitle || evaluationTitle.length > 120 || !evaluationQuestions.length) {
  evaluationMessage.textContent = 'Ce lien de questionnaire est incomplet.';
} else {
  const container = document.getElementById('evaluationQuestions');
  evaluationQuestions.forEach((question, index) => {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'evaluation-question';
    const legend = document.createElement('legend');
    legend.textContent = `${index + 1}. ${question.label}`;
    fieldset.append(legend);
    const choices = document.createElement('div');
    choices.className = 'evaluation-choices';
    for (let score = 1; score <= 5; score += 1) {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `question-${index}`;
      input.value = String(score);
      input.required = true;
      label.append(input, document.createTextNode(String(score)));
      choices.append(label);
    }
    fieldset.append(choices);
    container.append(fieldset);
  });
  evaluationForm.hidden = false;
  evaluationForm.addEventListener('submit', event => {
    event.preventDefault();
    const answers = Object.fromEntries(evaluationQuestions.map((question, index) => [question.id, Number(evaluationForm.elements[`question-${index}`].value)]));
    try {
      const key = 'parfait_training_demo_v1';
      const state = JSON.parse(localStorage.getItem(key) || '{}');
      const training = state[evaluationId] || {};
      training.responses = Array.isArray(training.responses) ? training.responses : [];
      training.responses.push({id: crypto.randomUUID(), answers});
      state[evaluationId] = training;
      localStorage.setItem(key, JSON.stringify(state));
      evaluationForm.hidden = true;
      evaluationMessage.textContent = 'Merci ! Votre réponse fictive apparaît maintenant dans les graphiques de la démo sur ce navigateur.';
    } catch { evaluationMessage.textContent = 'L’enregistrement local a échoué. Réessayez.'; }
  });
}
