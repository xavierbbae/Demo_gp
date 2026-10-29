const params = new URLSearchParams(location.search);
const formationId = params.get('id');
const formationTitle = params.get('formation');
const recipient = params.get('destinataire') || 'xymapartners.contact@gmail.com';
const isDemo = params.get('demo') === '1' && formationId?.startsWith('demo-');
const form = document.getElementById('registrationForm');
const message = document.getElementById('registrationMessage');

document.getElementById('formationTitle').textContent = formationTitle || 'Formation indisponible';
document.getElementById('formationMeta').textContent = [params.get('societe'), params.get('dates')].filter(Boolean).join(' · ');
if (isDemo) document.getElementById('registrationDisclaimer').textContent = 'Inscription fictive enregistrée sur ce navigateur uniquement. Aucune donnée n’est envoyée.';
if (!formationId || !formationTitle || formationId.length > 100 || formationTitle.length > 120 || (!isDemo && (!recipient || recipient.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)))) {
  form.hidden = true;
  message.textContent = 'Ce lien de formation est incomplet.';
} else {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    message.textContent = 'Envoi en cours…';
    if (isDemo) {
      try {
        const storageKey = 'parfait_training_demo_v1';
        const state = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const training = state[formationId] || {};
        const email = document.getElementById('workEmail').value.trim();
        training.participants = Array.isArray(training.participants) ? training.participants : [];
        if (training.participants.some(participant => participant.email.toLowerCase() === email.toLowerCase())) {
          message.textContent = 'Cette adresse est déjà inscrite dans cette démo.';
          button.disabled = false;
          return;
        }
        training.participants.push({id: crypto.randomUUID(), firstName: document.getElementById('firstName').value.trim(), lastName: document.getElementById('lastName').value.trim(), email, present: false});
        state[formationId] = training;
        localStorage.setItem(storageKey, JSON.stringify(state));
        form.hidden = true;
        message.textContent = 'Inscription fictive enregistrée. Le compteur de la démo est mis à jour sur ce navigateur.';
      } catch {
        message.textContent = 'L’enregistrement local a échoué. Réessayez.';
        button.disabled = false;
      }
      return;
    }
    try {
      const response = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(recipient), {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify({
          _subject: 'Inscription formation : ' + formationTitle,
          _replyto: document.getElementById('workEmail').value.trim(),
          Formation: formationTitle,
          Nom: document.getElementById('lastName').value.trim(),
          'Prénom': document.getElementById('firstName').value.trim(),
          email: document.getElementById('workEmail').value.trim()
        })
      });
      const result = await response.json();
      if (response.ok && /activat/i.test(result.message || '')) {
        form.hidden = true;
        message.textContent = 'Inscription reçue. L’organisateur doit confirmer l’e-mail d’activation avant de recevoir les réponses.';
        return;
      }
      if (!response.ok || (result.success !== true && result.success !== 'true')) throw new Error('Submission failed');
      form.hidden = true;
      message.textContent = 'Inscription envoyée. Merci !';
    } catch {
      message.textContent = 'L’envoi a échoué. Vérifiez votre connexion et réessayez.';
      button.disabled = false;
    }
  });
}
