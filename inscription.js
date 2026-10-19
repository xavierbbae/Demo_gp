const params = new URLSearchParams(location.search);
const formationId = params.get('id');
const formationTitle = params.get('formation');
const form = document.getElementById('registrationForm');
const message = document.getElementById('registrationMessage');

document.getElementById('formationTitle').textContent = formationTitle || 'Formation indisponible';
if (!formationId || !formationTitle || formationId.length > 100 || formationTitle.length > 120) {
  form.hidden = true;
  message.textContent = 'Ce lien de formation est incomplet.';
} else {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const key = 'parfait_training_responses_' + formationId;
    let responses = [];
    try {
      const stored = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(stored)) responses = stored;
    } catch {}
    responses.push({
      lastName: document.getElementById('lastName').value.trim(),
      firstName: document.getElementById('firstName').value.trim(),
      workEmail: document.getElementById('workEmail').value.trim(),
      submittedAt: new Date().toISOString()
    });
    try {
      localStorage.setItem(key, JSON.stringify(responses));
      form.hidden = true;
      message.textContent = 'Réponse enregistrée sur cet appareil. Pour une inscription réelle, contactez l’organisateur.';
    } catch {
      message.textContent = 'Enregistrement impossible sur cet appareil. Contactez l’organisateur.';
    }
  });
}
