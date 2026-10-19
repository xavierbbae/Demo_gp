const params = new URLSearchParams(location.search);
const formationId = params.get('id');
const formationTitle = params.get('formation');
const recipient = params.get('destinataire') || 'xymapartners.contact@gmail.com';
const form = document.getElementById('registrationForm');
const message = document.getElementById('registrationMessage');

document.getElementById('formationTitle').textContent = formationTitle || 'Formation indisponible';
if (!formationId || !formationTitle || !recipient || formationId.length > 100 || formationTitle.length > 120 || recipient.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
  form.hidden = true;
  message.textContent = 'Ce lien de formation est incomplet.';
} else {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    message.textContent = 'Envoi en cours…';
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
