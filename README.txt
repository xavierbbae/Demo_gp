GROUPE PARFAIT — DÉMO DASHBOARD

Publier le dossier sur un site statique ou le servir localement avec `python3 -m http.server 8000`.

Cette démo contient :
- les sociétés issues du référentiel fourni,
- les données légales publiques disponibles,
- une simulation déterministe de CA mensuel / résultat / N-1 / objectifs pour chaque société,
- un écran de performance consolidée,
- des fiches sociétés détaillées,
- des KPI et données internes modifiables dans le navigateur,
- quatre catégories groupe (Immobilier, Automobile, Alimentaire, Industrie) à confirmer par entreprise,
- un logiciel comptable et plusieurs autres logiciels/types renseignables par entreprise, avec choix courants ou saisie libre,
- les types de logiciels saisis librement sont ensuite proposés dans le menu déroulant des autres entreprises sur le même navigateur,
- une cartographie interactive en colonnes inspirée de la maquette fournie : groupe → pôle → entreprises ou famille logicielle → logiciel → entreprises, avec fil d’Ariane, retour, recherche avec suggestions, liaisons visuelles, comparateur logiciels × pôles et panneau de détail avec KPI,
- la sélection de plusieurs entreprises et l'ajout d'un même KPI au lot,
- un onglet de note privée par entreprise (stockée sur cet appareil),
- un thème marron,
- la création de liens pour des formulaires d'inscription aux formations,
- un écran de connexions comptables simulées (Sage, Cegid, Pennylane, EBP, ERP, imports SFTP/API),
- un export JSON enrichi.

IMPORTANT :
Les CA mensuels, résultats mensuels, objectifs, scores et connexions comptables sont des DONNÉES DE DÉMONSTRATION SIMULÉES. Quand un CA public > 0 existe, il sert de point d'ancrage à la simulation annuelle. Sinon, une base de démonstration est estimée selon la catégorie, le secteur et l'effectif disponible.

Les catégories, logiciels, KPI, notes et formulaires créés sont stockés localement dans le navigateur via localStorage. Les catégories proposées automatiquement à partir de l'activité publique ne sont que des suggestions. Le référentiel fourni contient moins de 200 entreprises : il faut importer les entreprises manquantes pour refléter le groupe complet.

La cartographie utilise les entreprises du dashboard. Huit sociétés réparties entre les quatre pôles ont chacune des exemples fictifs de logiciels comptables, de logiciels de gestion et de trois KPI métier (valeur et objectif), clairement signalés et désactivables dans cet onglet. Ces exemples ne sont jamais enregistrés dans les fiches ni inclus dans l'export JSON ; toute saisie réelle dans une fiche prend le dessus sur l'exemple correspondant. « Non renseigné » n'est pas compté comme logiciel utilisé. Les KPI et les simulations financières affichés dans la cartographie ne sont pas des chiffres réels.

FORMULAIRES D'INSCRIPTION :
Publier index.html, inscription.html, inscription.js, app.js, style.css et data/ sur le même site statique. Le lien créé dans l'onglet « Inscriptions formations » est partageable une fois le site publié. Le formulaire public demande Nom, Prénom et Mail pro puis transmet la réponse par FormSubmit à l'adresse choisie. L'adresse proposée est xymapartners.contact@gmail.com. Lors de la première soumission, le destinataire doit confirmer le courriel d'activation de FormSubmit ; les réponses sont ensuite acheminées par e-mail. Les anciens liens sans adresse destinataire utilisent l'adresse proposée. Les liens affichent l'adresse de réception dans leur URL. Les données sont traitées par un service tiers ; ne partager le formulaire qu'après validation de ce mode de collecte par le client.

Les notes dites privées n'ont pas d'authentification : toute personne ayant accès au même navigateur peut les consulter. Elles ne sont pas synchronisées entre appareils.
