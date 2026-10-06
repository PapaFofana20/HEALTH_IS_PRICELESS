export const articles = [
  {
    id: 'weight-loss-mistakes',
    title: { fr: '5 erreurs qui freinent ta perte de poids', en: '5 mistakes that slow your weight loss' },
    excerpt: { fr: 'Découvre les erreurs les plus courantes et comment les éviter.', en: 'Discover the most common mistakes and how to avoid them.' },
    category: 'weight-loss',
    image: 'https://images.pexels.com/photos/35419772/1200/750',
    readMinutes: 5,
    date: '2026-02-10',
    author: 'Inès Moreau',
    featured: true,
    sections: [
      {
        heading: { fr: 'Un déficit trop agressif', en: 'An overly aggressive deficit' },
        content: { fr: 'Réduire drastiquement les calories donne des résultats rapides au début, puis la fatigue et la faim prennent le dessus. Un déficit modéré, autour de 15 à 20 % de ta dépense, est bien plus simple à tenir sur plusieurs mois.', en: 'Slashing calories gives quick early results, then fatigue and hunger take over. A moderate deficit, around 15–20% of your expenditure, is much easier to sustain for months.' },
      },
      {
        heading: { fr: 'Oublier les protéines et la musculation', en: 'Skipping protein and strength training' },
        content: { fr: 'Sans stimulus musculaire ni apport protéique suffisant, une partie du poids perdu vient du muscle. Deux à trois séances de renforcement par semaine aident à préserver ta masse maigre.', en: 'Without a muscle stimulus and enough protein, part of the weight you lose comes from muscle. Two to three strength sessions a week help preserve lean mass.' },
      },
      {
        heading: { fr: 'Se fier uniquement à la balance', en: 'Relying only on the scale' },
        content: { fr: 'Le poids fluctue chaque jour selon l’hydratation et la digestion. Suis plutôt une moyenne hebdomadaire, ton tour de taille et tes performances à l’entraînement.', en: 'Body weight fluctuates daily with hydration and digestion. Track a weekly average, your waist measurement and your training performance instead.' },
      },
      {
        heading: { fr: 'Dormir trop peu', en: 'Sleeping too little' },
        content: { fr: 'Sous 6 heures de sommeil, la faim augmente et la satiété diminue : tu manges en moyenne 300 kcal de plus sans t’en rendre compte. Vise 7 à 9 heures, à heures régulières.', en: 'Under 6 hours of sleep, hunger rises and satiety drops: you eat about 300 kcal more without noticing. Aim for 7–9 hours on a regular schedule.' },
      },
      {
        heading: { fr: 'Boire ses calories', en: 'Drinking your calories' },
        content: { fr: 'Sodas, jus et cafés sucrés apportent des centaines de calories sans caler. Remplace-les par de l’eau, du thé ou du café nature : c’est souvent l’équivalent d’un repas économisé chaque jour.', en: 'Sodas, juices and sugary coffees add hundreds of calories without filling you up. Swap them for water, tea or black coffee: often the equivalent of a whole meal saved daily.' },
      },
      {
        heading: { fr: 'Vouloir tout changer d’un coup', en: 'Trying to change everything at once' },
        content: { fr: 'Régime strict + sport quotidien + zéro écart : intenable plus de trois semaines. Ajoute une habitude à la fois — marcher 8 000 pas, cuisiner le dimanche — et laisse chaque victoire en entraîner une autre.', en: 'Strict diet + daily sport + zero slip-ups: unsustainable past three weeks. Add one habit at a time — 8,000 steps, Sunday meal prep — and let each win fuel the next.' },
      },
    ],
  },
  {
    id: 'protein-guide',
    title: { fr: 'Guide complet des protéines', en: 'Complete protein guide' },
    excerpt: { fr: 'Tout ce que tu dois savoir sur les protéines.', en: 'Everything you need to know about protein.' },
    category: 'nutrition',
    image: 'https://images.pexels.com/photos/9213918/1200/750',
    readMinutes: 7,
    date: '2026-02-03',
    author: 'Léa Fontaine',
    featured: false,
    sections: [
      {
        heading: { fr: 'Les repères selon ton objectif', en: 'Targets for your goal' },
        content: { fr: 'Pour une personne active qui s’entraîne, les études situent les besoins entre 1,6 et 2,2 g de protéines par kilo de poids corporel et par jour, que l’objectif soit la perte de poids ou la prise de muscle.', en: 'For active people who train, research puts needs between 1.6 and 2.2 g of protein per kilo of body weight per day, whether the goal is fat loss or muscle gain.' },
      },
      {
        heading: { fr: 'Répartir sur la journée', en: 'Spread it across the day' },
        content: { fr: 'Viser 25 à 40 g par repas, sur 3 à 4 repas, est une stratégie simple et efficace pour la récupération et la satiété.', en: 'Aiming for 25–40 g per meal across 3–4 meals is a simple, effective strategy for recovery and satiety.' },
      },
      {
        heading: { fr: 'Les sources faciles', en: 'Easy sources' },
        content: { fr: 'Œufs, skyr, poulet, poisson, lentilles, tofu ou pois chiches : varie les sources animales et végétales pour couvrir aussi tes besoins en fibres et micronutriments.', en: 'Eggs, skyr, chicken, fish, lentils, tofu or chickpeas: mix animal and plant sources to also cover your fibre and micronutrient needs.' },
      },
      {
        heading: { fr: 'Le timing autour des séances', en: 'Timing around sessions' },
        content: { fr: 'Un repas protéiné dans les 2 à 3 heures qui suivent la séance optimise la récupération. Pas besoin de shaker en urgence au vestiaire : ton repas suivant fait l’affaire.', en: 'A protein meal within 2–3 hours after training optimises recovery. No need for an emergency locker-room shake: your next meal does the job.' },
      },
      {
        heading: { fr: 'Protéines et perte de poids', en: 'Protein and weight loss' },
        content: { fr: 'En déficit, monte vers 2 à 2,2 g/kg : les protéines calent le plus et protègent le muscle quand les calories baissent. C’est le nutriment à sécuriser en premier.', en: 'In a deficit, aim for 2–2.2 g/kg: protein satiates most and protects muscle when calories drop. It’s the nutrient to secure first.' },
      },
      {
        heading: { fr: 'Les idées reçues', en: 'Myths to drop' },
        content: { fr: 'Non, les protéines n’abîment pas les reins en bonne santé, et non, le corps n’est pas limité à 30 g par repas : la synthèse reste élevée plusieurs heures. Fie-toi aux totaux journaliers.', en: 'No, protein doesn’t harm healthy kidneys, and no, your body isn’t capped at 30 g per meal: synthesis stays elevated for hours. Trust daily totals.' },
      },
    ],
  },
];
