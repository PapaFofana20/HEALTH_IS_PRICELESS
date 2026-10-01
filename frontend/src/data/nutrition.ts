import type { MealPlan, NutritionTip, Recipe } from '../types';
import { media } from './media';

export const recipes: Recipe[] = [
  {
    id: 'overnight-oats',
    name: { fr: 'Overnight oats protéinés', en: 'Protein overnight oats' },
    image: media.recipes.overnightOats,
    goal: 'both',
    category: 'breakfast',
    prepMinutes: 10,
    calories: 420,
    protein: 30,
    carbs: 52,
    fat: 10,
    premium: false,
    description: {
      fr: 'Flocons d’avoine, skyr et fruits rouges préparés la veille : un petit déjeuner rassasiant, prêt en 2 minutes.',
      en: 'Oats, skyr and berries prepped the night before: a filling breakfast ready in 2 minutes.',
    },
    ingredients: {
      fr: ['50 g de flocons d’avoine', '150 g de skyr nature', '100 ml de lait ou boisson végétale', '80 g de fruits rouges', '1 c. à café de graines de chia', 'Cannelle'],
      en: ['50 g rolled oats', '150 g plain skyr', '100 ml milk or plant milk', '80 g berries', '1 tsp chia seeds', 'Cinnamon'],
    },
    steps: {
      fr: ['Mélange les flocons, le skyr, le lait et le chia dans un bocal.', 'Ajoute la cannelle et réserve une nuit au frais.', 'Le matin, ajoute les fruits rouges et déguste.'],
      en: ['Mix oats, skyr, milk and chia in a jar.', 'Add cinnamon and refrigerate overnight.', 'In the morning, top with berries and enjoy.'],
    },
  },
  {
    id: 'egg-white-omelette',
    name: { fr: 'Omelette épinards & feta', en: 'Spinach & feta omelette' },
    image: media.recipes.omelette,
    goal: 'weight-loss',
    category: 'breakfast',
    prepMinutes: 12,
    calories: 320,
    protein: 30,
    carbs: 22,
    fat: 12,
    premium: false,
    description: {
      fr: 'Une omelette légère et riche en protéines, servie avec une tranche de pain complet.',
      en: 'A light, protein-packed omelette served with a slice of wholegrain bread.',
    },
    ingredients: {
      fr: ['2 œufs entiers + 3 blancs', '60 g de jeunes pousses d’épinards', '30 g de feta', '1 tranche de pain complet', 'Sel, poivre, herbes'],
      en: ['2 whole eggs + 3 egg whites', '60 g baby spinach', '30 g feta', '1 slice wholegrain bread', 'Salt, pepper, herbs'],
    },
    steps: {
      fr: ['Fais revenir les épinards 1 minute à la poêle.', 'Verse les œufs battus et laisse cuire à feu doux.', 'Ajoute la feta, plie l’omelette et sers avec le pain grillé.'],
      en: ['Wilt the spinach in a pan for 1 minute.', 'Pour in the beaten eggs and cook over low heat.', 'Add the feta, fold and serve with toasted bread.'],
    },
  },
  {
    id: 'chicken-quinoa-bowl',
    name: { fr: 'Bowl poulet, quinoa & avocat', en: 'Chicken, quinoa & avocado bowl' },
    image: media.recipes.chickenBowl,
    goal: 'muscle-gain',
    category: 'lunch',
    prepMinutes: 25,
    calories: 640,
    protein: 48,
    carbs: 62,
    fat: 20,
    premium: false,
    description: {
      fr: 'Le bowl complet du midi : protéines maigres, glucides complexes et bons lipides.',
      en: 'The complete lunch bowl: lean protein, complex carbs and healthy fats.',
    },
    ingredients: {
      fr: ['150 g de blanc de poulet', '80 g de quinoa (cru)', '1/2 avocat', 'Tomates cerises, concombre', '1 c. à soupe d’huile d’olive', 'Jus de citron'],
      en: ['150 g chicken breast', '80 g quinoa (dry)', '1/2 avocado', 'Cherry tomatoes, cucumber', '1 tbsp olive oil', 'Lemon juice'],
    },
    steps: {
      fr: ['Cuis le quinoa 12 minutes dans l’eau bouillante.', 'Saisis le poulet assaisonné 6 à 8 minutes par face.', 'Assemble le bowl et arrose d’huile d’olive et de citron.'],
      en: ['Cook the quinoa for 12 minutes in boiling water.', 'Sear the seasoned chicken 6–8 minutes per side.', 'Assemble the bowl and drizzle with olive oil and lemon.'],
    },
  },
  {
    id: 'lentil-salad',
    name: { fr: 'Salade de lentilles & feta', en: 'Lentil & feta salad' },
    image: media.recipes.lentilSalad,
    goal: 'weight-loss',
    category: 'lunch',
    prepMinutes: 15,
    calories: 430,
    protein: 24,
    carbs: 45,
    fat: 15,
    premium: false,
    description: {
      fr: 'Fraîche, rassasiante et riche en fibres : idéale à emporter.',
      en: 'Fresh, filling and high in fibre: perfect to take away.',
    },
    ingredients: {
      fr: ['150 g de lentilles cuites', '40 g de feta', 'Poivron, oignon rouge, persil', '1 c. à soupe d’huile d’olive', 'Vinaigre balsamique'],
      en: ['150 g cooked lentils', '40 g feta', 'Bell pepper, red onion, parsley', '1 tbsp olive oil', 'Balsamic vinegar'],
    },
    steps: {
      fr: ['Coupe les légumes en petits dés.', 'Mélange avec les lentilles et la feta émiettée.', 'Assaisonne et laisse reposer 10 minutes au frais.'],
      en: ['Dice the vegetables.', 'Mix with the lentils and crumbled feta.', 'Season and chill for 10 minutes.'],
    },
  },
  {
    id: 'salmon-veggies',
    name: { fr: 'Saumon & légumes rôtis', en: 'Salmon & roasted vegetables' },
    image: media.recipes.salmon,
    goal: 'weight-loss',
    category: 'dinner',
    prepMinutes: 30,
    calories: 480,
    protein: 36,
    carbs: 24,
    fat: 26,
    premium: false,
    description: {
      fr: 'Un dîner simple sur une seule plaque, riche en oméga-3.',
      en: 'A simple one-tray dinner, rich in omega-3.',
    },
    ingredients: {
      fr: ['130 g de pavé de saumon', '250 g de légumes (brocoli, courgette, poivron)', '1 c. à café d’huile d’olive', 'Citron, aneth'],
      en: ['130 g salmon fillet', '250 g vegetables (broccoli, courgette, pepper)', '1 tsp olive oil', 'Lemon, dill'],
    },
    steps: {
      fr: ['Préchauffe le four à 200 °C.', 'Dispose les légumes et le saumon sur une plaque, assaisonne.', 'Enfourne 18 à 20 minutes et termine avec citron et aneth.'],
      en: ['Preheat the oven to 200 °C.', 'Arrange vegetables and salmon on a tray and season.', 'Bake 18–20 minutes and finish with lemon and dill.'],
    },
  },
  {
    id: 'beef-rice-bowl',
    name: { fr: 'Bœuf, riz & brocolis', en: 'Beef, rice & broccoli' },
    image: media.recipes.beefRice,
    goal: 'muscle-gain',
    category: 'dinner',
    prepMinutes: 25,
    calories: 720,
    protein: 50,
    carbs: 82,
    fat: 18,
    premium: false,
    description: {
      fr: 'L’assiette de récupération par excellence pour soutenir la prise de masse.',
      en: 'The ultimate recovery plate to support muscle gain.',
    },
    ingredients: {
      fr: ['150 g de bœuf haché 5 %', '90 g de riz basmati (cru)', '200 g de brocolis', 'Sauce soja, ail, gingembre', '1 c. à café d’huile de sésame'],
      en: ['150 g lean ground beef (5%)', '90 g basmati rice (dry)', '200 g broccoli', 'Soy sauce, garlic, ginger', '1 tsp sesame oil'],
    },
    steps: {
      fr: ['Cuis le riz et les brocolis à la vapeur.', 'Fais dorer le bœuf avec l’ail et le gingembre.', 'Déglace à la sauce soja et sers sur le riz.'],
      en: ['Cook the rice and steam the broccoli.', 'Brown the beef with garlic and ginger.', 'Deglaze with soy sauce and serve over rice.'],
    },
  },
  {
    id: 'tofu-bowl',
    name: { fr: 'Bowl tofu croustillant', en: 'Crispy tofu bowl' },
    image: media.recipes.tofuBowl,
    goal: 'weight-loss',
    category: 'dinner',
    prepMinutes: 20,
    calories: 450,
    protein: 28,
    carbs: 40,
    fat: 18,
    premium: false,
    description: {
      fr: 'Une option végétale, colorée et rassasiante pour le soir.',
      en: 'A colourful, filling plant-based option for dinner.',
    },
    ingredients: {
      fr: ['150 g de tofu ferme', '60 g de riz complet (cru)', 'Carotte, chou rouge, edamame', 'Sauce soja, graines de sésame'],
      en: ['150 g firm tofu', '60 g brown rice (dry)', 'Carrot, red cabbage, edamame', 'Soy sauce, sesame seeds'],
    },
    steps: {
      fr: ['Presse le tofu, coupe-le en dés et fais-le dorer.', 'Taille les légumes en julienne.', 'Assemble avec le riz et parsème de sésame.'],
      en: ['Press the tofu, dice it and pan-fry until golden.', 'Julienne the vegetables.', 'Assemble with the rice and sprinkle with sesame.'],
    },
  },
  {
    id: 'skyr-berries',
    name: { fr: 'Skyr, fruits rouges & amandes', en: 'Skyr, berries & almonds' },
    image: media.recipes.skyr,
    goal: 'both',
    category: 'snack',
    prepMinutes: 5,
    calories: 250,
    protein: 22,
    carbs: 22,
    fat: 8,
    premium: false,
    description: {
      fr: 'La collation protéinée express, parfaite après l’entraînement.',
      en: 'The express protein snack, perfect after training.',
    },
    ingredients: {
      fr: ['200 g de skyr', '80 g de fruits rouges', '15 g d’amandes', '1 c. à café de miel (optionnel)'],
      en: ['200 g skyr', '80 g berries', '15 g almonds', '1 tsp honey (optional)'],
    },
    steps: {
      fr: ['Verse le skyr dans un bol.', 'Ajoute les fruits rouges et les amandes concassées.'],
      en: ['Spoon the skyr into a bowl.', 'Top with berries and crushed almonds.'],
    },
  },
  {
    id: 'peanut-banana-shake',
    name: { fr: 'Shake banane & cacahuète', en: 'Banana & peanut butter shake' },
    image: media.recipes.shake,
    goal: 'muscle-gain',
    category: 'snack',
    prepMinutes: 5,
    calories: 520,
    protein: 35,
    carbs: 55,
    fat: 18,
    premium: false,
    description: {
      fr: 'Un shake dense en énergie pour atteindre facilement tes objectifs caloriques.',
      en: 'An energy-dense shake to hit your calorie targets easily.',
    },
    ingredients: {
      fr: ['1 banane', '30 g de whey ou 200 g de skyr', '1 c. à soupe de beurre de cacahuète', '40 g de flocons d’avoine', '250 ml de lait'],
      en: ['1 banana', '30 g whey or 200 g skyr', '1 tbsp peanut butter', '40 g rolled oats', '250 ml milk'],
    },
    steps: {
      fr: ['Mets tous les ingrédients dans un blender.', 'Mixe 30 secondes jusqu’à obtenir une texture lisse.'],
      en: ['Put all ingredients in a blender.', 'Blend for 30 seconds until smooth.'],
    },
  },
];

export const nutritionTips: NutritionTip[] = [
  {
    id: 'hydration',
    icon: 'droplets',
    title: { fr: 'Bois régulièrement', en: 'Stay hydrated' },
    text: { fr: '1,5 à 2 L d’eau par jour, davantage les jours d’entraînement.', en: '1.5–2 L of water a day, more on training days.' },
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
    title: { fr: 'La moitié de l’assiette en légumes', en: 'Half your plate in vegetables' },
    text: { fr: 'Fibres, volume et micronutriments pour peu de calories.', en: 'Fibre, volume and micronutrients for few calories.' },
  },
  {
    id: 'sleep',
    icon: 'moon',
    title: { fr: 'Dors 7 à 9 heures', en: 'Sleep 7–9 hours' },
    text: { fr: 'Le sommeil régule l’appétit et conditionne ta récupération musculaire.', en: 'Sleep regulates appetite and drives muscle recovery.' },
  },
  {
    id: 'mealprep',
    icon: 'chef',
    title: { fr: 'Prépare à l’avance', en: 'Prep ahead' },
    text: { fr: 'Cuisiner deux fois par semaine évite les choix impulsifs.', en: 'Cooking twice a week prevents impulsive choices.' },
  },
  {
    id: 'balance',
    icon: 'scale',
    title: { fr: 'La règle du 80/20', en: 'The 80/20 rule' },
    text: { fr: 'Des aliments bruts la plupart du temps, de la souplesse le reste : c’est ce qui dure.', en: 'Whole foods most of the time, flexibility the rest: that’s what lasts.' },
  },
];

export const mealPlans: MealPlan[] = [
  {
    goal: 'weight-loss',
    items: [
      { category: 'breakfast', recipeId: 'egg-white-omelette' },
      { category: 'lunch', recipeId: 'lentil-salad' },
      { category: 'snack', recipeId: 'skyr-berries' },
      { category: 'dinner', recipeId: 'salmon-veggies' },
    ],
  },
  {
    goal: 'muscle-gain',
    items: [
      { category: 'breakfast', recipeId: 'overnight-oats' },
      { category: 'lunch', recipeId: 'chicken-quinoa-bowl' },
      { category: 'snack', recipeId: 'peanut-banana-shake' },
      { category: 'dinner', recipeId: 'beef-rice-bowl' },
    ],
  },
];

export const getRecipeById = (id: string) => recipes.find((r) => r.id === id) ?? null;
