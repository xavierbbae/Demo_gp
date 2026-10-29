const supportTopics = {
  finance: {title: 'Piloter les KPI et le CA par société', steps: [
    ['Objectif', 'Lire le chiffre d’affaires, le résultat et l’évolution mensuelle de chaque société.'],
    ['Parcours', 'Ouvrir la vue d’ensemble, choisir une entreprise, puis comparer le mois courant avec N-1.'],
    ['Exercice', 'Définir un KPI métier avec une valeur et un objectif ; observer son affichage dans la fiche entreprise.'],
    ['À retenir', 'Les chiffres de la démo sont simulés. Une décision réelle exige des données comptables vérifiées.']
  ]},
  automobile: {title: 'Maîtriser le suivi du pôle Automobile', steps: [
    ['Objectif', 'Repérer les sociétés du pôle et suivre ventes, marges et rotation de stock.'],
    ['Parcours', 'Ouvrir Cartographie, sélectionner Automobile, puis afficher une fiche entreprise.'],
    ['Exercice', 'Comparer les KPI du pôle et attribuer un indicateur à plusieurs entreprises.'],
    ['À retenir', 'Un chef de pôle doit consulter seulement les données autorisées dans la future version de production.']
  ]},
  alimentaire: {title: 'Suivre les stocks et la performance Alimentaire', steps: [
    ['Objectif', 'Comprendre les indicateurs de disponibilité, de ruptures et de marge brute.'],
    ['Parcours', 'Filtrer les entreprises alimentaires et repérer leurs logiciels de gestion des stocks.'],
    ['Exercice', 'Créer un objectif de réduction des ruptures et vérifier son suivi sur la fiche société.'],
    ['À retenir', 'Les valeurs présentées ici servent uniquement à illustrer le parcours de formation.']
  ]},
  industrie: {title: 'Découvrir le pilotage du pôle Industrie', steps: [
    ['Objectif', 'Suivre production mensuelle, disponibilité et taux de rebuts.'],
    ['Parcours', 'Explorer le pôle Industrie dans la Cartographie et ouvrir les fiches des sociétés.'],
    ['Exercice', 'Comparer la valeur d’un KPI à son objectif et noter les actions correctrices.'],
    ['À retenir', 'Les connecteurs comptables sont encore simulés dans cette démo.']
  ]}
};
const topic = new URLSearchParams(location.search).get('module');
const support = Object.hasOwn(supportTopics, topic) ? supportTopics[topic] : null;
document.getElementById('supportTitle').textContent = support?.title || 'Support indisponible';
if (support) {
  const container = document.getElementById('supportContent');
  support.steps.forEach(([heading, description]) => {
    const section = document.createElement('section');
    const title = document.createElement('h2');
    const text = document.createElement('p');
    title.textContent = heading;
    text.textContent = description;
    section.append(title, text);
    container.append(section);
  });
}
