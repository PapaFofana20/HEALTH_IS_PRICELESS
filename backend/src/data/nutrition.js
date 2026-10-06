export const recipes = [
  {
    id: 'overnight-oats',
    name: { fr: 'Overnight oats protéinés', en: 'Protein overnight oats' },
    image: 'https://images.pexels.com/photos/12174224/800/560',
    goal: 'both',
    category: 'breakfast',
    prepMinutes: 10,
    calories: 420,
    protein: 30,
    carbs: 52,
    fat: 10,
    premium: false,
    description: {
      fr: 'Flocons d’avoine, skyr et fruits rouges préparés la veille.',
      en: 'Oats, skyr and berries prepped the night before.',
    },
    ingredients: {
      fr: ['50 g de flocons d\'avoine', '150 g de skyr nature', '100 ml de lait'],
      en: ['50 g rolled oats', '150 g plain skyr', '100 ml milk'],
    },
    steps: {
      fr: ['Mélanger les ingrédients dans un bocal.', 'Réserver une nuit au frais.'],
      en: ['Mix ingredients in a jar.', 'Refrigerate overnight.'],
    },
  },
  {
    id: 'chicken-quinoa-bowl',
    name: { fr: 'Bowl poulet, quinoa & avocat', en: 'Chicken, quinoa & avocado bowl' },
    image: 'https://images.pexels.com/photos/1591226/800/560',
    goal: 'muscle-gain',
    category: 'lunch',
    prepMinutes: 25,
    calories: 640,
    protein: 48,
    carbs: 62,
    fat: 20,
    premium: false,
    description: {
      fr: 'Le bowl complet du midi : protéines maigres, glucides complexes.',
      en: 'The complete lunch bowl: lean protein, complex carbs.',
    },
    ingredients: {
      fr: ['150 g de blanc de poulet', '80 g de quinoa', '1/2 avocat'],
      en: ['150 g chicken breast', '80 g quinoa', '1/2 avocado'],
    },
    steps: {
      fr: ['Cuire le quinoa 12 minutes.', 'Saisir le poulet 6-8 minutes par face.'],
      en: ['Cook quinoa 12 minutes.', 'Sear chicken 6-8 minutes per side.'],
    },
  },
];

export const nutritionTips = [
  {
    id: 'hydration',
    icon: 'droplets',
    title: { fr: 'Bois régulièrement', en: 'Stay hydrated' },
    text: { fr: '1,5 à 2 L d\'eau par jour, davantage les jours d\'entraînement.', en: '1.5–2 L of water a day, more on training days.' },
  },
  {
    id: 'protein',
    icon: 'beef',
    title: { fr: 'Des protéines à chaque repas', en: 'Protein at every meal' },
    text: { fr: 'Répartir ton apport sur 3 à 4 repas facilite la récupération et la satiété.', en: 'Spreading intake over 3–4 meals helps recovery and satiety.' },
  },
  {
    id: 'veggies',
    icon: 'salad',
    title: { fr: 'La moitié de l\'assiette en légumes', en: 'Half your plate in vegetables' },
    text: { fr: 'Fibres, volume et micronutriments pour peu de calories.', en: 'Fibre, volume and micronutrients for few calories.' },
  },
  {
    id: 'sleep',
    icon: 'moon',
    title: { fr: 'Dors 7 à 9 heures', en: 'Sleep 7–9 hours' },
    text: { fr: 'Le sommeil régule l\'appétit et conditionne ta récupération musculaire.', en: 'Sleep regulates appetite and drives muscle recovery.' },
  },
  {
    id: 'mealprep',
    icon: 'chef',
    title: { fr: 'Prépare à l\'avance', en: 'Prep ahead' },
    text: { fr: 'Cuisiner deux fois par semaine évite les choix impulsifs.', en: 'Cooking twice a week prevents impulsive choices.' },
  },
  {
    id: 'balance',
    icon: 'scale',
    title: { fr: 'La règle du 80/20', en: 'The 80/20 rule' },
    text: { fr: 'Des aliments bruts la plupart du temps, de la souplesse le reste : c\'est ce qui dure.', en: 'Whole foods most of the time, flexibility the rest: that\'s what lasts.' },
  },
];

export const mealPlans = [
  {
    goal: 'weight-loss',
    items: [
      { category: 'breakfast', recipeId: 'overnight-oats' },
      { category: 'lunch', recipeId: 'chicken-quinoa-bowl' },
    ],
  },
  {
    goal: 'muscle-gain',
    items: [
      { category: 'breakfast', recipeId: 'overnight-oats' },
      { category: 'lunch', recipeId: 'chicken-quinoa-bowl' },
    ],
  },
];
