import type { Article } from '../types';
import { media } from './media';

export const articles: Article[] = [
  {
    id: 'weight-loss-mistakes',
    title: { fr: '5 erreurs qui ralentissent ta perte de poids', en: '5 mistakes slowing down your weight loss' },
    excerpt: {
      fr: 'Déficit trop agressif, protéines oubliées, sommeil négligé… Les pièges les plus fréquents et comment les éviter.',
      en: 'Overly aggressive deficits, forgotten protein, neglected sleep… The most common traps and how to avoid them.',
    },
    category: 'weight-loss',
    image: media.articles.weightLossMistakes,
    readMinutes: 9,
    date: '2026-02-10',
    author: 'Inès Moreau',
    featured: true,
    sections: [
      {
        heading: { fr: 'Un déficit trop agressif', en: 'An overly aggressive deficit' },
        body: {
          fr: 'Réduire drastiquement les calories donne des résultats rapides au début, puis la fatigue et la faim prennent le dessus. Un déficit modéré, autour de 15 à 20 % de ta dépense, est bien plus simple à tenir sur plusieurs mois.',
          en: 'Slashing calories gives quick early results, then fatigue and hunger take over. A moderate deficit, around 15–20% of your expenditure, is much easier to sustain for months.',
        },
      },
      {
        heading: { fr: 'Oublier les protéines et la musculation', en: 'Skipping protein and strength training' },
        body: {
          fr: 'Sans stimulus musculaire ni apport protéique suffisant, une partie du poids perdu vient du muscle. Deux à trois séances de renforcement par semaine aident à préserver ta masse maigre.',
          en: 'Without a muscle stimulus and enough protein, part of the weight you lose comes from muscle. Two to three strength sessions a week help preserve lean mass.',
        },
      },
      {
        heading: { fr: 'Se fier uniquement à la balance', en: 'Relying only on the scale' },
        body: {
          fr: 'Le poids fluctue chaque jour selon l’hydratation et la digestion. Suis plutôt une moyenne hebdomadaire, ton tour de taille et tes performances à l’entraînement.',
          en: 'Body weight fluctuates daily with hydration and digestion. Track a weekly average, your waist measurement and your training performance instead.',
        },
      },
      {
        heading: { fr: 'Dormir trop peu', en: 'Sleeping too little' },
        body: {
          fr: 'Sous 6 heures de sommeil, la faim augmente et la satiété diminue : tu manges en moyenne 300 kcal de plus sans t’en rendre compte. Vise 7 à 9 heures, à heures régulières.',
          en: 'Under 6 hours of sleep, hunger rises and satiety drops: you eat about 300 kcal more without noticing. Aim for 7–9 hours on a regular schedule.',
        },
      },
      {
        heading: { fr: 'Boire ses calories', en: 'Drinking your calories' },
        body: {
          fr: 'Sodas, jus et cafés sucrés apportent des centaines de calories sans caler. Remplace-les par de l’eau, du thé ou du café nature : c’est souvent l’équivalent d’un repas économisé chaque jour.',
          en: 'Sodas, juices and sugary coffees add hundreds of calories without filling you up. Swap them for water, tea or black coffee: often the equivalent of a whole meal saved daily.',
        },
      },
      {
        heading: { fr: 'Vouloir tout changer d’un coup', en: 'Trying to change everything at once' },
        body: {
          fr: 'Régime strict + sport quotidien + zéro écart : intenable plus de trois semaines. Ajoute une habitude à la fois — marcher 8 000 pas, cuisiner le dimanche — et laisse chaque victoire en entraîner une autre.',
          en: 'Strict diet + daily sport + zero slip-ups: unsustainable past three weeks. Add one habit at a time — 8,000 steps, Sunday meal prep — and let each win fuel the next.',
        },
      },
    ],
  },
  {
    id: 'how-much-protein',
    title: { fr: 'Combien de protéines faut-il manger ?', en: 'How much protein should you eat?' },
    excerpt: {
      fr: 'Les repères scientifiques selon ton objectif, et comment les atteindre simplement au quotidien.',
      en: 'Science-based targets for your goal, and how to hit them easily every day.',
    },
    category: 'nutrition',
    image: media.articles.proteinSources,
    readMinutes: 8,
    date: '2026-02-03',
    author: 'Léa Fontaine',
    featured: false,
    sections: [
      {
        heading: { fr: 'Les repères selon ton objectif', en: 'Targets for your goal' },
        body: {
          fr: 'Pour une personne active qui s’entraîne, les études situent les besoins entre 1,6 et 2,2 g de protéines par kilo de poids corporel et par jour, que l’objectif soit la perte de poids ou la prise de muscle.',
          en: 'For active people who train, research puts needs between 1.6 and 2.2 g of protein per kilo of body weight per day, whether the goal is fat loss or muscle gain.',
        },
      },
      {
        heading: { fr: 'Répartir sur la journée', en: 'Spread it across the day' },
        body: {
          fr: 'Viser 25 à 40 g par repas, sur 3 à 4 repas, est une stratégie simple et efficace pour la récupération et la satiété.',
          en: 'Aiming for 25–40 g per meal across 3–4 meals is a simple, effective strategy for recovery and satiety.',
        },
      },
      {
        heading: { fr: 'Les sources faciles', en: 'Easy sources' },
        body: {
          fr: 'Œufs, skyr, poulet, poisson, lentilles, tofu ou pois chiches : varie les sources animales et végétales pour couvrir aussi tes besoins en fibres et micronutriments.',
          en: 'Eggs, skyr, chicken, fish, lentils, tofu or chickpeas: mix animal and plant sources to also cover your fibre and micronutrient needs.',
        },
      },
      {
        heading: { fr: 'Le timing autour des séances', en: 'Timing around sessions' },
        body: {
          fr: 'Un repas protéiné dans les 2 à 3 heures qui suivent la séance optimise la récupération. Pas besoin de shaker en urgence au vestiaire : ton repas suivant fait l’affaire.',
          en: 'A protein meal within 2–3 hours after training optimises recovery. No need for an emergency locker-room shake: your next meal does the job.',
        },
      },
      {
        heading: { fr: 'Protéines et perte de poids', en: 'Protein and weight loss' },
        body: {
          fr: 'En déficit, monte vers 2 à 2,2 g/kg : les protéines calent le plus et protègent le muscle quand les calories baissent. C’est le nutriment à sécuriser en premier.',
          en: 'In a deficit, aim for 2–2.2 g/kg: protein satiates most and protects muscle when calories drop. It’s the nutrient to secure first.',
        },
      },
      {
        heading: { fr: 'Les idées reçues', en: 'Myths to drop' },
        body: {
          fr: 'Non, les protéines n’abîment pas les reins en bonne santé, et non, le corps n’est pas limité à 30 g par repas : la synthèse reste élevée plusieurs heures. Fie-toi aux totaux journaliers.',
          en: 'No, protein doesn’t harm healthy kidneys, and no, your body isn’t capped at 30 g per meal: synthesis stays elevated for hours. Trust daily totals.',
        },
      },
    ],
  },
  {
    id: 'start-weight-training',
    title: { fr: 'Comment commencer la musculation\u00a0?', en: 'How to start strength training' },
    excerpt: {
      fr: 'Fréquence, exercices, charges : le guide pour bien démarrer sans te blesser.',
      en: 'Frequency, exercises, loads: the guide to getting started safely.',
    },
    category: 'training',
    image: media.articles.startTraining,
    readMinutes: 10,
    date: '2026-01-27',
    author: 'Karim Benali',
    featured: false,
    sections: [
      {
        heading: { fr: 'Commence par les mouvements de base', en: 'Start with the basics' },
        body: {
          fr: 'Squat, fentes, pompes, rowing et gainage couvrent l’essentiel du corps. Maîtrise la technique avec des charges légères avant d’ajouter du poids.',
          en: 'Squats, lunges, push-ups, rows and planks cover most of the body. Master the technique with light loads before adding weight.',
        },
      },
      {
        heading: { fr: 'Deux à trois séances par semaine', en: 'Two to three sessions a week' },
        body: {
          fr: 'Des séances full body espacées d’au moins un jour suffisent pour progresser au début. La régularité compte plus que l’intensité.',
          en: 'Full-body sessions with at least a day in between are enough to progress early on. Consistency matters more than intensity.',
        },
      },
      {
        heading: { fr: 'Progresser petit à petit', en: 'Progress gradually' },
        body: {
          fr: 'Ajoute une répétition ou un peu de charge quand toutes tes séries sont propres. Note tes séances : c’est le meilleur moyen de voir tes progrès.',
          en: 'Add a rep or a little weight when all your sets are clean. Log your sessions: it’s the best way to see your progress.',
        },
      },
      {
        heading: { fr: 'L’échauffement non négociable', en: 'The non-negotiable warm-up' },
        body: {
          fr: 'Cinq à dix minutes suffisent : mobilité articulaire, puis deux séries légères du premier exercice. Un muscle chaud se blesse moins et produit plus de force.',
          en: 'Five to ten minutes is enough: joint mobility, then two light sets of the first exercise. A warm muscle gets injured less and produces more force.',
        },
      },
      {
        heading: { fr: 'Manger et dormir pour progresser', en: 'Eat and sleep to progress' },
        body: {
          fr: 'Le muscle se construit entre les séances : vise 1,6 à 2 g de protéines par kilo et 7 à 9 heures de sommeil. Sans carburant ni repos, même le meilleur programme stagne.',
          en: 'Muscle is built between sessions: aim for 1.6–2 g of protein per kilo and 7–9 hours of sleep. Without fuel or rest, even the best program stalls.',
        },
      },
      {
        heading: { fr: 'Quand demander de l’aide', en: 'When to ask for help' },
        body: {
          fr: 'Douleur articulaire persistante, stagnation de plus d’un mois, doute sur un mouvement : un coach, même pour une séance, corrige en une heure ce que des mois d’essais ne règlent pas.',
          en: 'Persistent joint pain, plateaus over a month, doubts about a movement: a coach, even for one session, fixes in an hour what months of trial and error won’t.',
        },
      },
    ],
  },
  {
    id: 'cardio-vs-weights',
    title: { fr: 'Cardio ou musculation pour perdre du poids\u00a0?', en: 'Cardio or weights for weight loss?' },
    excerpt: {
      fr: 'Le match n’a pas lieu d’être : voici comment combiner les deux intelligemment.',
      en: 'It’s not a contest: here’s how to combine both intelligently.',
    },
    category: 'weight-loss',
    image: media.articles.cardioBattle,
    readMinutes: 9,
    date: '2026-01-20',
    author: 'Inès Moreau',
    featured: false,
    sections: [
      {
        heading: { fr: 'Ce que fait le cardio', en: 'What cardio does' },
        body: {
          fr: 'Le cardio augmente ta dépense énergétique et améliore ta santé cardiovasculaire. Il est facile à doser et à pratiquer presque partout.',
          en: 'Cardio increases your energy expenditure and improves cardiovascular health. It’s easy to dose and can be done almost anywhere.',
        },
      },
      {
        heading: { fr: 'Ce que fait la musculation', en: 'What strength training does' },
        body: {
          fr: 'La musculation préserve et développe ta masse musculaire, ce qui soutient ton métabolisme et redessine ta silhouette pendant la perte de poids.',
          en: 'Strength training preserves and builds muscle, which supports your metabolism and reshapes your body as you lose weight.',
        },
      },
      {
        heading: { fr: 'La meilleure combinaison', en: 'The best combination' },
        body: {
          fr: 'Deux à trois séances de renforcement, complétées par du cardio modéré et une activité quotidienne comme la marche : c’est la formule la plus efficace et la plus durable.',
          en: 'Two to three strength sessions, plus moderate cardio and daily activity like walking: that’s the most effective and sustainable formula.',
        },
      },
      {
        heading: { fr: 'Le rôle sous-estimé de la marche', en: 'The underestimated role of walking' },
        body: {
          fr: 'Huit à dix mille pas par jour brûlent 300 à 500 kcal sans faim ni fatigue. C’est souvent la variable qui fait la différence entre une perte qui stagne et une perte qui avance.',
          en: 'Eight to ten thousand steps a day burn 300–500 kcal with no hunger or fatigue. It’s often the variable between a stalled and a moving weight loss.',
        },
      },
      {
        heading: { fr: 'HIIT : puissant mais dosé', en: 'HIIT: powerful but dosed' },
        body: {
          fr: 'Une à deux séances intenses par semaine suffisent : intervalles de 20 à 30 secondes, récupération complète. Au-delà, la fatigue cannibalise ta musculation.',
          en: 'One to two intense sessions a week is enough: 20–30 second intervals with full recovery. Beyond that, fatigue cannibalises your strength work.',
        },
      },
      {
        heading: { fr: 'Exemple de semaine type', en: 'Sample week' },
        body: {
          fr: 'Lundi : musculation haut du corps. Mercredi : musculation bas du corps + 20 min de vélo. Vendredi : full body. Marche quotidienne et un footing léger le week-end si l’envie est là.',
          en: 'Monday: upper-body strength. Wednesday: lower-body strength + 20 min cycling. Friday: full body. Daily walking plus an easy weekend jog if you feel like it.',
        },
      },
    ],
  },
  {
    id: 'bench-press-progress',
    title: { fr: 'Comment progresser au développé couché\u00a0?', en: 'How to improve your bench press' },
    excerpt: {
      fr: 'Technique, volume, exercices complémentaires : les leviers pour faire enfin bouger la barre.',
      en: 'Technique, volume, accessory work: the levers to finally move the bar.',
    },
    category: 'muscle-gain',
    image: media.articles.benchPress,
    readMinutes: 11,
    date: '2026-01-13',
    author: 'Karim Benali',
    featured: false,
    sections: [
      {
        heading: { fr: 'Soigne ton installation', en: 'Nail your setup' },
        body: {
          fr: 'Omoplates serrées, pieds ancrés, poignets alignés : une installation stable te permet de transmettre plus de force et protège tes épaules.',
          en: 'Shoulder blades squeezed, feet planted, wrists stacked: a stable setup lets you transfer more force and protects your shoulders.',
        },
      },
      {
        heading: { fr: 'Travaille dans plusieurs zones', en: 'Train across rep ranges' },
        body: {
          fr: 'Alterne des séries lourdes de 3 à 5 répétitions et des séries de 8 à 12 pour développer à la fois la force et le volume musculaire.',
          en: 'Alternate heavy sets of 3–5 reps with sets of 8–12 to build both strength and muscle size.',
        },
      },
      {
        heading: { fr: 'Renforce les points faibles', en: 'Strengthen weak points' },
        body: {
          fr: 'Pompes lestées, développé militaire et rowing renforcent les triceps, les épaules et le dos, indispensables à un développé solide.',
          en: 'Weighted push-ups, overhead presses and rows strengthen the triceps, shoulders and back — all essential for a solid bench.',
        },
      },
      {
        heading: { fr: 'La trajectoire de la barre', en: 'The bar path' },
        body: {
          fr: 'La barre ne monte pas à la verticale : elle part du bas des pectoraux et finit au-dessus des épaules, en léger arc. Pense à « pousser vers l’arrière » autant que vers le haut.',
          en: 'The bar doesn’t travel straight up: it starts over your lower chest and ends above your shoulders, in a slight arc. Think “push back” as much as “push up”.',
        },
      },
      {
        heading: { fr: 'Le leg drive, ton allié', en: 'Leg drive, your ally' },
        body: {
          fr: 'Pieds ancrés, fessiers sur le banc : pousse le sol comme pour glisser vers l’arrière. Cette tension des jambes ajoute des kilos à ta barre sans effort supplémentaire des bras.',
          en: 'Feet planted, glutes on the bench: push the floor as if sliding backwards. That leg tension adds kilos to your press with no extra arm effort.',
        },
      },
      {
        heading: { fr: 'Programme sur 6 semaines', en: 'A 6-week plan' },
        body: {
          fr: 'Semaines 1-2 : 4×8 à charge modérée. Semaines 3-4 : 5×5 plus lourd. Semaines 5-6 : 3×3 puis test. Ajoute 2,5 kg par semaine tant que la technique reste propre.',
          en: 'Weeks 1–2: 4×8 at moderate load. Weeks 3–4: heavier 5×5. Weeks 5–6: 3×3 then test. Add 2.5 kg a week while technique stays clean.',
        },
      },
    ],
  },
  {
    id: 'sleep-recovery',
    title: { fr: 'Sommeil et récupération : le pilier oublié', en: 'Sleep and recovery: the forgotten pillar' },
    excerpt: {
      fr: 'Pourquoi tes progrès se construisent aussi en dehors de la salle.',
      en: 'Why your progress is also built outside the gym.',
    },
    category: 'recovery',
    image: media.articles.sleep,
    readMinutes: 8,
    date: '2026-01-06',
    author: 'Léa Fontaine',
    featured: false,
    sections: [
      {
        heading: { fr: 'Le sommeil, ton meilleur allié', en: 'Sleep, your best ally' },
        body: {
          fr: 'Pendant le sommeil profond, ton corps répare les fibres musculaires et régule les hormones de la faim. Vise 7 à 9 heures par nuit.',
          en: 'During deep sleep your body repairs muscle fibres and regulates hunger hormones. Aim for 7–9 hours a night.',
        },
      },
      {
        heading: { fr: 'La récupération active', en: 'Active recovery' },
        body: {
          fr: 'Marche, mobilité ou vélo léger les jours de repos favorisent la circulation sans ajouter de fatigue.',
          en: 'Walking, mobility work or easy cycling on rest days boosts circulation without adding fatigue.',
        },
      },
      {
        heading: { fr: 'Écoute les signaux', en: 'Listen to the signals' },
        body: {
          fr: 'Fatigue persistante, baisse de motivation ou performances en recul : ce sont des signes qu’il faut alléger une semaine.',
          en: 'Persistent fatigue, low motivation or declining performance are signs you need a lighter week.',
        },
      },
      {
        heading: { fr: 'La régularité des horaires', en: 'Consistent timing' },
        body: {
          fr: 'Se coucher et se lever à heures fixes, même le week-end, stabilise ton horloge interne. La qualité du sommeil compte autant que sa durée.',
          en: 'Going to bed and waking up at fixed times, even on weekends, stabilises your internal clock. Sleep quality matters as much as duration.',
        },
      },
      {
        heading: { fr: 'Écrans et caféine', en: 'Screens and caffeine' },
        body: {
          fr: 'Coupe les écrans 30 à 60 minutes avant de dormir et évite le café après 14 h : la demi-vie de la caféine dépasse 5 heures et rogne ton sommeil profond.',
          en: 'Cut screens 30–60 minutes before bed and skip coffee after 2pm: caffeine’s half-life exceeds 5 hours and eats into your deep sleep.',
        },
      },
      {
        heading: { fr: 'Siestes stratégiques', en: 'Strategic naps' },
        body: {
          fr: 'Une sieste de 15 à 20 minutes en début d’après-midi recharge sans casser la nuit. Au-delà de 30 minutes, tu risques l’inertie et des difficultés d’endormissement.',
          en: 'A 15–20 minute early-afternoon nap recharges without breaking the night. Past 30 minutes you risk grogginess and harder bedtimes.',
        },
      },
    ],
  },
  {
    id: 'home-workout-no-equipment',
    title: { fr: 'Se muscler à la maison sans matériel', en: 'Build muscle at home with no equipment' },
    excerpt: {
      fr: 'Pompes, squats, gainage : un programme maison efficace avec zéro équipement.',
      en: 'Push-ups, squats, planks: an effective home plan with zero equipment.',
    },
    category: 'training',
    image: media.articles.homeWorkout,
    readMinutes: 8,
    date: '2026-02-20',
    author: 'Inès Moreau',
    featured: false,
    sections: [
      {
        heading: { fr: 'Les mouvements de base', en: 'The basic moves' },
        body: {
          fr: 'Pompes, squats, fentes, gainage et burpees couvrent tout le corps. Maîtrise d’abord la technique, puis augmente séries et répétitions.',
          en: 'Push-ups, squats, lunges, planks and burpees cover the whole body. Master technique first, then add sets and reps.',
        },
      },
      {
        heading: { fr: 'Progresser sans charge', en: 'Progress without weights' },
        body: {
          fr: 'Ralentis le tempo, ajoute des pauses en bas du mouvement et réduis les temps de repos : l’intensité vient de l’exécution, pas du matériel.',
          en: 'Slow the tempo, add pauses at the bottom and shorten rests: intensity comes from execution, not equipment.',
        },
      },
      {
        heading: { fr: 'La régularité avant tout', en: 'Consistency above all' },
        body: {
          fr: 'Trois séances de 30 minutes par semaine valent mieux qu’une grosse séance mensuelle. Bloque tes créneaux comme des rendez-vous.',
          en: 'Three 30-minute sessions a week beat one big monthly workout. Schedule them like appointments.',
        },
      },
      {
        heading: { fr: 'Un coin sport minimal', en: 'A minimal workout corner' },
        body: {
          fr: 'Un tapis et deux mètres carrés suffisent pour 90 % des mouvements. Un élastique et une chaise solide ouvrent des dizaines de variantes quand tu progresses.',
          en: 'A mat and two square metres cover 90% of moves. A band and a sturdy chair unlock dozens of variations as you progress.',
        },
      },
      {
        heading: { fr: 'Exemple de séance 30 minutes', en: 'Sample 30-minute session' },
        body: {
          fr: 'Échauffement articulaire 5 min, puis 4 tours : 12 squats, 10 pompes, 12 fentes par jambe, 30 s de gainage, 1 min de repos. Finis par 5 minutes d’étirements doux.',
          en: '5-min joint warm-up, then 4 rounds: 12 squats, 10 push-ups, 12 lunges per leg, 30 s plank, 1 min rest. Finish with 5 minutes of gentle stretching.',
        },
      },
      {
        heading: { fr: 'Quand passer en salle', en: 'When to join a gym' },
        body: {
          fr: 'Quand les pompes et les squats deviennent faciles en séries de 20+, la salle apporte charges et machines pour continuer à progresser. Jusque-là, la maison suffit largement.',
          en: 'When push-ups and squats feel easy for 20+ reps, a gym brings loads and machines to keep progressing. Until then, home is plenty.',
        },
      },
    ],
  },
  {
    id: 'muscle-gain-calories',
    title: { fr: 'Prise de masse : combien manger en plus ?', en: 'Muscle gain: how much extra to eat?' },
    excerpt: {
      fr: 'Le surplus calorique idéal pour construire du muscle sans prendre trop de gras.',
      en: 'The ideal calorie surplus to build muscle without excess fat.',
    },
    category: 'muscle-gain',
    image: media.articles.protein,
    readMinutes: 9,
    date: '2026-02-17',
    author: 'Léa Fontaine',
    featured: false,
    sections: [
      {
        heading: { fr: 'Un léger surplus suffit', en: 'A small surplus is enough' },
        body: {
          fr: 'Vise 200 à 300 kcal au-dessus de ta dépense : assez pour construire du muscle, pas assez pour accumuler beaucoup de gras.',
          en: 'Aim for 200–300 kcal above expenditure: enough to build muscle, not enough to gain much fat.',
        },
      },
      {
        heading: { fr: 'Les protéines d’abord', en: 'Protein first' },
        body: {
          fr: 'Garde 1,6 à 2,2 g de protéines par kilo et par jour, puis complète avec des glucides autour des séances pour l’énergie.',
          en: 'Keep 1.6–2.2 g of protein per kilo per day, then add carbs around sessions for energy.',
        },
      },
      {
        heading: { fr: 'Suis la courbe', en: 'Track the curve' },
        body: {
          fr: 'Une prise de 200 à 400 g par semaine est idéale. Si la balance stagne deux semaines, ajoute 100 à 150 kcal.',
          en: 'Gaining 200–400 g a week is ideal. If the scale stalls for two weeks, add 100–150 kcal.',
        },
      },
      {
        heading: { fr: 'Musculation : la priorité', en: 'Training comes first' },
        body: {
          fr: 'Sans stimulus, le surplus fait du gras, pas du muscle. Trois à quatre séances avec des charges qui augmentent : c’est l’entraînement qui « décide » où vont les calories.',
          en: 'Without stimulus, a surplus builds fat, not muscle. Three to four sessions with rising loads: training “decides” where calories go.',
        },
      },
      {
        heading: { fr: 'Le sommeil, constructeur discret', en: 'Sleep, the quiet builder' },
        body: {
          fr: 'L’hormone de croissance culmine en début de nuit : se coucher tôt et dormir 7 à 9 heures, c’est offrir à tes muscles leur meilleur chantier de construction.',
          en: 'Growth hormone peaks early at night: sleeping 7–9 hours from an early bedtime gives your muscles their best construction site.',
        },
      },
      {
        heading: { fr: 'Les erreurs fréquentes', en: 'Common mistakes' },
        body: {
          fr: 'Manger « propre » mais trop peu, sauter des séances, changer de programme chaque mois : la prise de masse récompense la patience et la constance, pas les à-coups.',
          en: 'Eating “clean” but too little, skipping sessions, switching programs monthly: mass gain rewards patience and consistency, not bursts.',
        },
      },
    ],
  },
  {
    id: 'eat-healthy-budget',
    title: { fr: 'Bien manger avec un petit budget', en: 'Eating well on a small budget' },
    excerpt: {
      fr: 'Protéines et repas équilibrés sans vider ton portefeuille : les aliments qui en donnent le plus pour ton argent.',
      en: 'Protein and balanced meals without emptying your wallet: the foods that give you most for your money.',
    },
    category: 'nutrition',
    image: media.recipes.lentilSalad,
    readMinutes: 8,
    date: '2026-02-14',
    author: 'Inès Moreau',
    featured: false,
    sections: [
      {
        heading: { fr: 'Les protéines pas chères', en: 'Cheap protein' },
        body: {
          fr: 'Œufs, lentilles, pois chiches, poulet entier et skyr nature offrent le meilleur rapport protéines-prix. Achète en gros format.',
          en: 'Eggs, lentils, chickpeas, whole chicken and plain skyr offer the best protein per price. Buy in bulk.',
        },
      },
      {
        heading: { fr: 'Cuisine simple, pas chère', en: 'Simple, cheap cooking' },
        body: {
          fr: 'Riz, patates douces, flocons d’avoine et légumes de saison : une base saine qui coûte peu et cale bien.',
          en: 'Rice, sweet potatoes, oats and seasonal vegetables: a cheap, filling, healthy base.',
        },
      },
      {
        heading: { fr: 'Prépare à l’avance', en: 'Meal prep' },
        body: {
          fr: 'Cuisiner deux grosses marmites par semaine divise le coût par repas et évite les achats impulsifs.',
          en: 'Cooking two big batches a week cuts the cost per meal and avoids impulse buys.',
        },
      },
      {
        heading: { fr: 'Le marché et les saisons', en: 'Markets and seasons' },
        body: {
          fr: 'Fruits et légumes de saison coûtent jusqu’à deux fois moins cher et ont plus de goût. En fin de marché, les prix chutent encore.',
          en: 'Seasonal produce costs up to half as much and tastes better. At closing time, market prices drop further.',
        },
      },
      {
        heading: { fr: 'Évite le gaspillage', en: 'Stop wasting food' },
        body: {
          fr: 'Restes transformés en lunch du lendemain, pain rassis en chapelure, fanes en soupe : chaque aliment jeté, c’est de l’argent jeté. Planifie les repas avant les courses.',
          en: 'Leftovers turned into tomorrow’s lunch, stale bread into breadcrumbs, tops into soup: every wasted food is wasted money. Plan meals before shopping.',
        },
      },
      {
        heading: { fr: 'Exemple de journée à petit prix', en: 'Sample budget day' },
        body: {
          fr: 'Petit-déjeuner : flocons d’avoine + œufs. Midi : riz, lentilles, carottes. Collation : skyr + banane. Soir : omelette, patates douces, salade. Équilibré pour une poignée de francs.',
          en: 'Breakfast: oats + eggs. Lunch: rice, lentils, carrots. Snack: skyr + banana. Dinner: omelette, sweet potatoes, salad. Balanced for pocket change.',
        },
      },
    ],
  },
  {
    id: 'active-rest-day',
    title: { fr: 'Jour de repos : rester actif sans forcer', en: 'Rest day: stay active without pushing' },
    excerpt: {
      fr: 'Marche, mobilité, sommeil : comment récupérer plus vite entre deux séances.',
      en: 'Walking, mobility, sleep: how to recover faster between sessions.',
    },
    category: 'recovery',
    image: media.articles.restBeach,
    readMinutes: 7,
    date: '2026-02-11',
    author: 'Léa Fontaine',
    featured: false,
    sections: [
      {
        heading: { fr: 'Bouger doucement', en: 'Move gently' },
        body: {
          fr: '7 000 à 10 000 pas, un peu de mobilité hanches-épaules : assez pour activer la circulation, pas assez pour fatiguer.',
          en: '7,000–10,000 steps plus some hip and shoulder mobility: enough to boost circulation, not enough to tire you.',
        },
      },
      {
        heading: { fr: 'Dormir pour progresser', en: 'Sleep to progress' },
        body: {
          fr: 'C’est pendant le sommeil que les muscles se réparent. Couche-toi à heure fixe et vise 7 à 9 heures.',
          en: 'Muscles repair while you sleep. Go to bed at a fixed time and aim for 7–9 hours.',
        },
      },
      {
        heading: { fr: 'Gérer le stress', en: 'Manage stress' },
        body: {
          fr: 'Le stress chronique freine la récupération. Respiration lente, balade sans écran : de petits rituels qui changent tout.',
          en: 'Chronic stress slows recovery. Slow breathing, screen-free walks: small rituals that change everything.',
        },
      },
      {
        heading: { fr: 'Mobilité douce', en: 'Gentle mobility' },
        body: {
          fr: 'Dix minutes de mobilité hanches, épaules et colonne le matin d’un jour off entretiennent les amplitudes sans fatigue. Pense cercles lents et respiration profonde.',
          en: 'Ten minutes of hip, shoulder and spine mobility on an off-day morning maintain range without fatigue. Think slow circles and deep breathing.',
        },
      },
      {
        heading: { fr: 'Hydratation et alimentation du jour off', en: 'Off-day fuel and fluids' },
        body: {
          fr: 'On mange pareil les jours sans sport : le muscle se répare aujourd’hui avec les protéines d’hier et d’aujourd’hui. Bois 1,5 à 2 litres d’eau dans la journée.',
          en: 'Eat the same on rest days: muscle repairs today with yesterday’s and today’s protein. Drink 1.5–2 litres of water through the day.',
        },
      },
      {
        heading: { fr: 'La semaine de décharge', en: 'The deload week' },
        body: {
          fr: 'Toutes les 6 à 8 semaines, divise volumes et charges par deux pendant une semaine. Tu reviendras plus fort : la fatigue masque souvent les progrès.',
          en: 'Every 6–8 weeks, halve volumes and loads for a week. You’ll come back stronger: fatigue often masks progress.',
        },
      },
    ],
  },
];
