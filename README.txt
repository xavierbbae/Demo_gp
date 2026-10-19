GROUPE PARFAIT — DÉMO DASHBOARD

Ouvrir index.html dans un navigateur.

Cette démo contient :
- les sociétés issues du référentiel fourni,
- les données légales publiques disponibles,
- une simulation déterministe de CA mensuel / résultat / N-1 / objectifs pour chaque société,
- un écran de performance consolidée,
- des fiches sociétés détaillées,
- des KPI et données internes modifiables dans le navigateur,
- la sélection de plusieurs entreprises et l'ajout d'un même KPI au lot,
- un onglet de note privée par entreprise (stockée sur cet appareil),
- un thème marron,
- la création de liens pour des formulaires d'inscription aux formations,
- un écran de connexions comptables simulées (Sage, Cegid, Pennylane, EBP, ERP, imports SFTP/API),
- un export JSON enrichi.

IMPORTANT :
Les CA mensuels, résultats mensuels, objectifs, scores et connexions comptables sont des DONNÉES DE DÉMONSTRATION SIMULÉES. Quand un CA public > 0 existe, il sert de point d'ancrage à la simulation annuelle. Sinon, une base de démonstration est estimée selon la catégorie, le secteur et l'effectif disponible.

Les modifications sont stockées localement dans le navigateur via localStorage.

FORMULAIRES D'INSCRIPTION :
Publier index.html, inscription.html, inscription.js, app.js, style.css et data/ sur le même site statique. Le lien créé dans l'onglet « Inscriptions formations » est partageable une fois le site publié. Le formulaire public demande Nom, Prénom et Mail pro. Dans cette démo HTML/CSS/JS, « Envoyer » enregistre la réponse uniquement dans le navigateur du répondant ; le créateur ne la reçoit pas sur son appareil. Pour recevoir de vraies inscriptions, il faut connecter un service de réception ou ajouter un backend. Ne pas utiliser cette démo pour collecter de vraies données personnelles.

Les notes dites privées n'ont pas d'authentification : toute personne ayant accès au même navigateur peut les consulter. Elles ne sont pas synchronisées entre appareils.
