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
- un module Formations : formations en cours/à venir, historique, création d'une formation avec entreprise et date ou période, lien d'inscription, trois parcours terminés fictifs, supports, feuille de présence, questionnaire personnalisable et graphiques d'impact,
- un écran de connexions comptables par entreprise : catalogue de logiciels, recherche et filtres de sociétés, saisie d'un logiciel synchronisée avec Entreprises et Cartographie, statut et dernière synchronisation simulés par société,
- un export JSON enrichi.

IMPORTANT :
Les CA mensuels, résultats mensuels, objectifs, scores et connexions comptables sont des DONNÉES DE DÉMONSTRATION SIMULÉES. Quand un CA public > 0 existe, il sert de point d'ancrage à la simulation annuelle. Sinon, une base de démonstration est estimée selon la catégorie, le secteur et l'effectif disponible.

Les catégories, logiciels, KPI, notes et formulaires créés sont stockés localement dans le navigateur via localStorage. Les catégories proposées automatiquement à partir de l'activité publique ne sont que des suggestions. Le référentiel fourni contient moins de 200 entreprises : il faut importer les entreprises manquantes pour refléter le groupe complet.

CONNEXIONS COMPTABLES :
L'onglet suit chaque entreprise séparément. Huit logiciels issus de l'échantillon de Cartographie peuvent y apparaître comme exemples fictifs ; deux montrent aussi une connexion de démonstration. Un logiciel saisi ici devient une donnée interne réelle de la démo et se retrouve dans Entreprises et Cartographie. Changer le logiciel invalide l'ancien statut de connexion. Les actions Connecter, Actualiser et Déconnecter ne contactent aucun logiciel comptable : elles modifient uniquement un état local avec une date de synchronisation simulée. Le tableau de bord ne doit pas être interprété comme une remontée de données comptables vérifiées.

La cartographie utilise les entreprises du dashboard. Huit sociétés réparties entre les quatre pôles ont chacune des exemples fictifs de logiciels comptables, de logiciels de gestion et de trois KPI métier (valeur et objectif), clairement signalés et désactivables dans cet onglet. Ces exemples ne sont jamais enregistrés dans les fiches ni inclus dans l'export JSON ; toute saisie réelle dans une fiche prend le dessus sur l'exemple correspondant. « Non renseigné » n'est pas compté comme logiciel utilisé. Les KPI et les simulations financières affichés dans la cartographie ne sont pas des chiffres réels.

FORMATIONS :
Publier tout le dossier, notamment index.html, training.js, training.css, connections.js, connections.css, inscription.html, inscription.js, evaluation.html, evaluation.js, support-formation.html, support-formation.js, app.js, style.css et data/ sur le même site statique. Trois formations terminées et une formation à venir sont des exemples fictifs. Leur formulaire d'inscription, leur feuille de présence, leurs supports, leur questionnaire et leurs graphiques sont interactifs. Les questions ajoutées, fichiers importés (PDF, PNG, JPG ou texte, 1 Mo maximum), présences et réponses testées sont stockés uniquement dans le navigateur local. Les liens publics des exemples ne remontent les réponses au dashboard que si le répondant utilise le même profil de navigateur sur ce même appareil. Les supports importés localement ne sont pas visibles sur un autre appareil.

Une formation test créée dans l'onglet Formations conserve un formulaire public de Nom, Prénom et Mail pro. Ses réponses sont transmises par FormSubmit à l'adresse choisie, proposée par défaut comme xymapartners.contact@gmail.com. Lors du premier envoi, le destinataire doit confirmer l'e-mail d'activation. Les anciens liens sans destinataire utilisent l'adresse proposée. Les données passent par un service tiers ; ce mode de collecte doit être validé par le client. Les comptes d'inscrits centralisés, les supports, les présences et les évaluations des formations créées sont volontairement verrouillés dans la démo. Ils nécessitent un serveur et une base de données sécurisée ; le module actuel ne prétend pas synchroniser les réponses entre appareils.

Les notes dites privées n'ont pas d'authentification : toute personne ayant accès au même navigateur peut les consulter. Elles ne sont pas synchronisées entre appareils.
