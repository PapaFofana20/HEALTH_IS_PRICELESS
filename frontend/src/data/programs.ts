import type {
  Coach,
  DayType,
  Goal,
  Localized,
  Plan,
  PlanPrice,
  PricingFeature,
  Program,
  ProgramDay,
  ProgramPhase,
  SessionExercise,
  WorkoutSession,
} from '../types';
import { avatar, media } from './media';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const L = (fr: string, en: string): Localized => ({ fr, en });
const ex = (exerciseId: string, sets: number, reps: Localized | string, restSeconds: number): SessionExercise => ({
  exerciseId,
  sets,
  reps: typeof reps === 'string' ? { fr: reps, en: reps } : reps,
  restSeconds,
});
const day = (type: DayType, title: Localized, minutes: number): ProgramDay => ({ type, title, minutes });
const REST = day('rest', L('Repos', 'Rest'), 0);
const MOBILITY = day('mobility', L('Mobilité & marche', 'Mobility & walk'), 20);

/* ---------- Coaches ---------- */
export const coaches: Coach[] = [
  {
    id: 'ines',
    name: 'Inès Moreau',
    role: L('Coach HIIT & perte de poids', 'HIIT & weight-loss coach'),
    bio: L(
      '10 ans d’expérience en préparation physique et en accompagnement de reprise sportive.',
      '10 years of experience in conditioning and helping people return to training.',
    ),
    avatar: avatar('women', 65),
  },
  {
    id: 'karim',
    name: 'Karim Benali',
    role: L('Préparateur physique — force & hypertrophie', 'Strength & hypertrophy coach'),
    bio: L(
      'Ancien athlète de force, spécialiste de la programmation et de la surcharge progressive.',
      'Former strength athlete, specialised in programming and progressive overload.',
    ),
    avatar: avatar('men', 52),
  },
  {
    id: 'lea',
    name: 'Léa Fontaine',
    role: L('Coach remise en forme & mobilité', 'Fitness & mobility coach'),
    bio: L(
      'Elle aide les débutants à construire des routines simples, efficaces et durables.',
      'She helps beginners build simple, effective and sustainable routines.',
    ),
    avatar: avatar('women', 12),
  },
];

/* ---------- Reusable sessions ---------- */
const upperBody: WorkoutSession = {
  id: 'upper-body',
  title: L('Upper Body', 'Upper Body'),
  focus: L('Pectoraux, dos, épaules et bras', 'Chest, back, shoulders and arms'),
  minutes: 45,
  exercises: [
    ex('bench-press', 4, '8-10', 90),
    ex('dumbbell-row', 4, '10-12', 75),
    ex('shoulder-press', 3, '10', 75),
    ex('pull-up', 3, '6-8', 90),
    ex('push-up', 3, 'max', 60),
    ex('bicep-curl', 3, '12', 60),
    ex('plank', 3, '40 s', 45),
    ex('mountain-climber', 3, '30 s', 30),
  ],
};
const lowerBody: WorkoutSession = {
  id: 'lower-body',
  title: L('Lower Body', 'Lower Body'),
  focus: L('Quadriceps, fessiers et ischios', 'Quads, glutes and hamstrings'),
  minutes: 50,
  exercises: [
    ex('squat', 4, '10', 120),
    ex('deadlift', 4, '6-8', 120),
    ex('lunge', 3, L('12 / jambe', '12 / leg'), 75),
    ex('kettlebell-swing', 3, '20', 60),
    ex('plank', 3, '45 s', 45),
  ],
};
const hiitExpress: WorkoutSession = {
  id: 'hiit-express',
  title: L('HIIT Express', 'HIIT Express'),
  focus: L('Cardio et dépense énergétique', 'Conditioning and energy output'),
  minutes: 30,
  exercises: [
    ex('burpee', 5, '40 s / 20 s', 20),
    ex('mountain-climber', 5, '40 s / 20 s', 20),
    ex('kettlebell-swing', 4, '15', 30),
    ex('squat', 4, L('20 sautés', '20 jump'), 30),
    ex('plank', 3, '30 s', 30),
  ],
};
const fullBodyA: WorkoutSession = {
  id: 'full-body-a',
  title: L('Full Body A', 'Full Body A'),
  focus: L('Mouvements fondamentaux', 'Fundamental movements'),
  minutes: 30,
  exercises: [
    ex('squat', 3, '15', 60),
    ex('push-up', 3, '10', 60),
    ex('dumbbell-row', 3, '12', 60),
    ex('lunge', 3, L('10 / jambe', '10 / leg'), 60),
    ex('plank', 3, '30 s', 45),
  ],
};
const fullBodyB: WorkoutSession = {
  id: 'full-body-b',
  title: L('Full Body B', 'Full Body B'),
  focus: L('Force et gainage', 'Strength and core'),
  minutes: 40,
  exercises: [
    ex('lunge', 3, L('12 / jambe', '12 / leg'), 60),
    ex('push-up', 3, '12', 60),
    ex('kettlebell-swing', 3, '15', 60),
    ex('shoulder-press', 3, '12', 60),
    ex('mountain-climber', 3, '30 s', 30),
    ex('plank', 3, '40 s', 45),
  ],
};
const cardioSoft: WorkoutSession = {
  id: 'cardio-soft',
  title: L('Cardio doux', 'Low-impact cardio'),
  focus: L('Endurance et récupération', 'Endurance and recovery'),
  minutes: 25,
  exercises: [
    ex('mountain-climber', 4, L('30 s lent', '30 s slow'), 30),
    ex('squat', 3, '20', 45),
    ex('lunge', 3, L('10 / jambe', '10 / leg'), 45),
    ex('plank', 3, '30 s', 30),
  ],
};
const push: WorkoutSession = {
  id: 'push',
  title: L('Push', 'Push'),
  focus: L('Pectoraux, épaules et triceps', 'Chest, shoulders and triceps'),
  minutes: 60,
  exercises: [ex('bench-press', 5, '5', 150), ex('shoulder-press', 4, '8-10', 90), ex('push-up', 3, 'max', 60), ex('plank', 3, '45 s', 45)],
};
const pull: WorkoutSession = {
  id: 'pull',
  title: L('Pull', 'Pull'),
  focus: L('Dos et biceps', 'Back and biceps'),
  minutes: 60,
  exercises: [ex('deadlift', 4, '5', 150), ex('pull-up', 4, '6-8', 120), ex('dumbbell-row', 4, '10', 90), ex('bicep-curl', 3, '12', 60)],
};
const legs: WorkoutSession = {
  id: 'legs',
  title: L('Legs', 'Legs'),
  focus: L('Jambes et fessiers', 'Legs and glutes'),
  minutes: 60,
  exercises: [ex('squat', 5, '5', 150), ex('lunge', 3, L('10 / jambe', '10 / leg'), 90), ex('kettlebell-swing', 3, '15', 60), ex('plank', 3, '45 s', 45)],
};
const homeUpper: WorkoutSession = {
  id: 'home-upper',
  title: L('Haut du corps maison', 'Home upper body'),
  focus: L('Haltères et poids du corps', 'Dumbbells and bodyweight'),
  minutes: 45,
  exercises: [ex('push-up', 4, '12-15', 60), ex('dumbbell-row', 4, '12', 60), ex('shoulder-press', 4, '12', 60), ex('bicep-curl', 3, '15', 45), ex('plank', 3, '45 s', 45)],
};
const homeLower: WorkoutSession = {
  id: 'home-lower',
  title: L('Bas du corps maison', 'Home lower body'),
  focus: L('Volume et contrôle du tempo', 'Volume and tempo control'),
  minutes: 45,
  exercises: [
    ex('squat', 4, L('20 (tempo 3 s)', '20 (3 s tempo)'), 60),
    ex('lunge', 4, L('12 / jambe', '12 / leg'), 60),
    ex('kettlebell-swing', 4, '20', 45),
    ex('mountain-climber', 3, '30 s', 30),
  ],
};

/* ---------- Phases ---------- */
function makePhases(goal: Goal, weeks: number): ProgramPhase[] {
  const a = Math.max(1, Math.round(weeks * 0.25));
  const b = Math.max(a + 1, Math.round(weeks * 0.7));
  const texts: [Localized, Localized][] =
    goal === 'weight-loss'
      ? [
          [L('Mise en route', 'Kick-off'), L('Apprentissage des mouvements, cardio modéré et mise en place des habitudes.', 'Learn the movements, moderate cardio and build your habits.')],
          [L('Accélération', 'Acceleration'), L('Séances plus denses et intervalles plus intenses.', 'Denser sessions and more intense intervals.')],
          [L('Consolidation', 'Consolidation'), L('Tests de progression et routine durable pour la suite.', 'Progress tests and a sustainable routine for what comes next.')],
        ]
      : [
          [L('Fondations', 'Foundations'), L('Technique, volume modéré et choix des charges de travail.', 'Technique, moderate volume and choosing working weights.')],
          [L('Hypertrophie', 'Hypertrophy'), L('Volume progressif et surcharge sur les exercices clés.', 'Progressive volume and overload on key lifts.')],
          [L('Force', 'Strength'), L('Charges plus lourdes, séries plus courtes et tests de performance.', 'Heavier loads, shorter sets and performance tests.')],
        ];
  const ranges: [number, number][] = [
    [1, a],
    [a + 1, b],
    [b + 1, weeks],
  ];
  return ranges.map(([from, to], i) => ({ from, to: Math.max(from, to), title: texts[i][0], description: texts[i][1] }));
}

/* ---------- Programs ---------- */
const DEFAULT_PROGRAMS: Program[] = [
  {
    id: 'fat-burn-starter',
    name: L('Fat Burn Starter', 'Fat Burn Starter'),
    tagline: L('Le programme idéal pour te (re)mettre en mouvement.', 'The ideal program to get (back) into motion.'),
    description: L(
      'Trois séances courtes par semaine, à la maison, pour brûler des calories, renforcer tout le corps et installer une routine qui tient. Chaque mouvement est expliqué et adaptable à ton niveau.',
      'Three short sessions a week at home to burn calories, strengthen your whole body and build a routine that sticks. Every movement is explained and scalable to your level.',
    ),
    goal: 'weight-loss',
    level: 'beginner',
    plan: 'standard',
    location: 'home',
    durationWeeks: 6,
    sessionsPerWeek: 3,
    sessionMinutes: 25,
    image: media.programs.fatBurn,
    coachId: 'lea',
    rating: 4.7,
    enrolled: 1840,
    popular: true,
    objectives: {
      fr: ['Installer 3 séances régulières par semaine', 'Améliorer ton endurance cardio', 'Renforcer les muscles posturaux', 'Apprendre les mouvements de base en sécurité'],
      en: ['Build a habit of 3 sessions a week', 'Improve your cardio endurance', 'Strengthen your postural muscles', 'Learn the basic movements safely'],
    },
    equipment: {
      fr: ['Tapis de sol', 'Une paire d’haltères légers (optionnel)', 'Une bouteille d’eau'],
      en: ['Exercise mat', 'A pair of light dumbbells (optional)', 'A water bottle'],
    },
    weekPlan: [
      day('strength', L('Full Body A', 'Full Body A'), 30),
      day('mobility', L('Marche active', 'Active walk'), 20),
      day('hiit', L('Cardio doux', 'Low-impact cardio'), 25),
      REST,
      day('strength', L('Full Body B', 'Full Body B'), 30),
      day('mobility', L('Mobilité', 'Mobility'), 15),
      REST,
    ],
    phases: makePhases('weight-loss', 6),
    sessions: [fullBodyA, cardioSoft, fullBodyB],
  },
  {
    id: 'transformation-30',
    name: L('Transformation 30 jours', '30-Day Transformation'),
    tagline: L('Un mois intense et structuré pour relancer ta progression.', 'One intense, structured month to kick-start your progress.'),
    description: L(
      'Cinq séances par semaine qui alternent renforcement, HIIT et cardio long. Tu peux t’entraîner à la maison ou en salle : chaque séance propose une variante. Idéal pour casser la routine avec un cadre clair.',
      'Five sessions a week alternating strength, HIIT and longer cardio. Train at home or at the gym: each session comes with a variation. Ideal to break the routine with a clear framework.',
    ),
    goal: 'weight-loss',
    level: 'intermediate',
    plan: 'premium',
    location: 'both',
    durationWeeks: 4,
    sessionsPerWeek: 5,
    sessionMinutes: 45,
    image: media.programs.transformation,
    coachId: 'ines',
    rating: 4.8,
    enrolled: 2310,
    popular: true,
    objectives: {
      fr: ['Augmenter ta dépense énergétique hebdomadaire', 'Progresser sur des intervalles plus exigeants', 'Gagner en force sur les mouvements clés', 'Suivre tes mesures chaque semaine'],
      en: ['Increase your weekly energy expenditure', 'Progress on more demanding intervals', 'Get stronger on key movements', 'Track your measurements every week'],
    },
    equipment: {
      fr: ['Haltères ou kettlebell', 'Tapis de sol', 'Corde à sauter (optionnel)', 'Accès salle (optionnel)'],
      en: ['Dumbbells or kettlebell', 'Exercise mat', 'Jump rope (optional)', 'Gym access (optional)'],
    },
    weekPlan: [
      day('strength', L('Full Body', 'Full Body'), 45),
      day('hiit', L('HIIT Express', 'HIIT Express'), 30),
      day('strength', L('Lower Body', 'Lower Body'), 50),
      REST,
      day('strength', L('Upper Body', 'Upper Body'), 45),
      day('cardio', L('Cardio long', 'Long cardio'), 45),
      REST,
    ],
    phases: makePhases('weight-loss', 4),
    sessions: [fullBodyB, hiitExpress, lowerBody, upperBody],
  },
  {
    id: 'lean-and-strong',
    name: L('Lean & Strong', 'Lean & Strong'),
    tagline: L('Perds du gras en gardant ta force : musculation + HIIT.', 'Lose fat while keeping your strength: weights + HIIT.'),
    description: L(
      'Un programme en salle qui combine musculation et intervalles pour préserver ta masse musculaire pendant la perte de poids. Quatre séances par semaine, une progression claire et des repères chiffrés.',
      'A gym program combining strength training and intervals to preserve muscle while you lose weight. Four sessions a week, clear progression and measurable targets.',
    ),
    goal: 'weight-loss',
    level: 'intermediate',
    plan: 'standard',
    location: 'gym',
    durationWeeks: 8,
    sessionsPerWeek: 4,
    sessionMinutes: 45,
    image: media.programs.leanStrong,
    coachId: 'karim',
    rating: 4.8,
    enrolled: 1570,
    popular: false,
    objectives: {
      fr: ['Préserver ta masse musculaire en déficit', 'Progresser sur les charges de travail', 'Améliorer ta condition physique', 'Construire une routine efficace en salle'],
      en: ['Preserve muscle mass in a deficit', 'Progress on your working weights', 'Improve your conditioning', 'Build an effective gym routine'],
    },
    equipment: {
      fr: ['Accès à une salle de sport', 'Barre et haltères', 'Kettlebell', 'Barre de traction'],
      en: ['Gym access', 'Barbell and dumbbells', 'Kettlebell', 'Pull-up bar'],
    },
    weekPlan: [
      day('strength', L('Upper Body', 'Upper Body'), 45),
      day('strength', L('Lower Body', 'Lower Body'), 50),
      REST,
      day('hiit', L('HIIT Express', 'HIIT Express'), 30),
      day('strength', L('Full Body', 'Full Body'), 40),
      MOBILITY,
      REST,
    ],
    phases: makePhases('weight-loss', 8),
    sessions: [upperBody, lowerBody, hiitExpress, fullBodyB],
  },
  {
    id: 'hiit-shred',
    name: L('HIIT Shred', 'HIIT Shred'),
    tagline: L('Des intervalles exigeants pour les athlètes confirmés.', 'Demanding intervals for experienced athletes.'),
    description: L(
      'Cinq séances courtes et intenses qui mélangent pliométrie, kettlebell et renforcement. Conçu pour les pratiquants avancés qui veulent optimiser leur condition physique et leur composition corporelle.',
      'Five short, intense sessions mixing plyometrics, kettlebell work and strength. Built for advanced trainees who want to sharpen conditioning and body composition.',
    ),
    goal: 'weight-loss',
    level: 'advanced',
    plan: 'premium',
    location: 'both',
    durationWeeks: 8,
    sessionsPerWeek: 5,
    sessionMinutes: 30,
    image: media.programs.hiitShred,
    coachId: 'ines',
    rating: 4.9,
    enrolled: 980,
    popular: false,
    objectives: {
      fr: ['Repousser ton seuil de fatigue', 'Améliorer ta puissance et ton explosivité', 'Maximiser la dépense sur des séances courtes', 'Maintenir ta force en période de sèche'],
      en: ['Push back your fatigue threshold', 'Improve power and explosiveness', 'Maximise output in short sessions', 'Maintain strength while leaning out'],
    },
    equipment: {
      fr: ['Kettlebell', 'Box ou banc stable', 'Tapis de sol', 'Chronomètre'],
      en: ['Kettlebell', 'Plyo box or sturdy bench', 'Exercise mat', 'Timer'],
    },
    weekPlan: [
      day('hiit', L('HIIT Express', 'HIIT Express'), 30),
      day('strength', L('Full Body', 'Full Body'), 40),
      day('hiit', L('HIIT Pyramide', 'HIIT Pyramid'), 30),
      day('mobility', L('Mobilité', 'Mobility'), 20),
      day('hiit', L('HIIT Express', 'HIIT Express'), 30),
      day('strength', L('Lower Body', 'Lower Body'), 45),
      REST,
    ],
    phases: makePhases('weight-loss', 8),
    sessions: [hiitExpress, fullBodyB, lowerBody],
  },
  {
    id: 'mass-foundations',
    name: L('Bases de la masse', 'Mass Foundations'),
    tagline: L('Apprends les mouvements clés et pose des bases solides.', 'Learn the key lifts and build a solid base.'),
    description: L(
      'Trois séances par semaine en salle pour maîtriser les exercices polyarticulaires, comprendre la surcharge progressive et commencer à construire du muscle de façon durable.',
      'Three gym sessions a week to master compound lifts, understand progressive overload and start building muscle sustainably.',
    ),
    goal: 'muscle-gain',
    level: 'beginner',
    plan: 'standard',
    location: 'gym',
    durationWeeks: 6,
    sessionsPerWeek: 3,
    sessionMinutes: 45,
    image: media.programs.massFoundations,
    coachId: 'karim',
    rating: 4.7,
    enrolled: 1320,
    popular: false,
    objectives: {
      fr: ['Maîtriser squat, développé couché et rowing', 'Comprendre la surcharge progressive', 'Gagner tes premiers kilos de force', 'Structurer ton alimentation pour la prise de masse'],
      en: ['Master squats, bench press and rows', 'Understand progressive overload', 'Gain your first strength milestones', 'Structure your diet for muscle gain'],
    },
    equipment: {
      fr: ['Accès à une salle de sport', 'Barre et disques', 'Haltères', 'Banc de musculation'],
      en: ['Gym access', 'Barbell and plates', 'Dumbbells', 'Weight bench'],
    },
    weekPlan: [
      day('strength', L('Full Body', 'Full Body'), 45),
      REST,
      day('strength', L('Upper Body', 'Upper Body'), 45),
      REST,
      day('strength', L('Lower Body', 'Lower Body'), 50),
      MOBILITY,
      REST,
    ],
    phases: makePhases('muscle-gain', 6),
    sessions: [fullBodyA, upperBody, lowerBody],
  },
  {
    id: 'home-hypertrophy',
    name: L('Hypertrophie maison', 'Home Hypertrophy'),
    tagline: L('Construis du muscle sans salle, avec haltères et poids du corps.', 'Build muscle without a gym, using dumbbells and bodyweight.'),
    description: L(
      'Quatre séances haut / bas du corps pensées pour la maison. Tempo contrôlé, séries proches de l’échec et progression par répétitions : tout ce qu’il faut pour stimuler la croissance musculaire avec peu de matériel.',
      'Four upper / lower sessions designed for home. Controlled tempo, sets close to failure and rep-based progression: everything you need to drive muscle growth with minimal equipment.',
    ),
    goal: 'muscle-gain',
    level: 'intermediate',
    plan: 'standard',
    location: 'home',
    durationWeeks: 6,
    sessionsPerWeek: 4,
    sessionMinutes: 45,
    image: media.programs.homeHypertrophy,
    coachId: 'lea',
    rating: 4.6,
    enrolled: 1105,
    popular: false,
    objectives: {
      fr: ['Augmenter ton volume musculaire à la maison', 'Progresser par le tempo et les répétitions', 'Renforcer le haut et le bas du corps', 'Garder une routine simple et régulière'],
      en: ['Build muscle at home', 'Progress through tempo and reps', 'Strengthen upper and lower body', 'Keep a simple, consistent routine'],
    },
    equipment: {
      fr: ['Haltères réglables', 'Élastiques de résistance', 'Tapis de sol', 'Chaise ou banc stable'],
      en: ['Adjustable dumbbells', 'Resistance bands', 'Exercise mat', 'Sturdy chair or bench'],
    },
    weekPlan: [
      day('strength', L('Haut du corps', 'Upper body'), 45),
      day('strength', L('Bas du corps', 'Lower body'), 45),
      REST,
      day('strength', L('Haut du corps', 'Upper body'), 45),
      day('strength', L('Bas du corps', 'Lower body'), 45),
      MOBILITY,
      REST,
    ],
    phases: makePhases('muscle-gain', 6),
    sessions: [homeUpper, homeLower],
  },
  {
    id: 'muscle-builder',
    name: L('Muscle Builder', 'Muscle Builder'),
    tagline: L('Le programme complet pour gagner du muscle en 8 semaines.', 'The complete program to build muscle in 8 weeks.'),
    description: L(
      'Une structure Push / Pull / Legs + Upper éprouvée, avec un volume ajusté semaine après semaine. Des séances de 60 minutes, des repères de charge et des conseils nutritionnels pour soutenir ta prise de masse.',
      'A proven Push / Pull / Legs + Upper split with volume adjusted week after week. 60-minute sessions, load targets and nutrition guidance to support your mass gain.',
    ),
    goal: 'muscle-gain',
    level: 'intermediate',
    plan: 'premium',
    location: 'gym',
    durationWeeks: 8,
    sessionsPerWeek: 4,
    sessionMinutes: 60,
    image: media.programs.muscleBuilder,
    coachId: 'karim',
    rating: 4.9,
    enrolled: 2680,
    popular: true,
    objectives: {
      fr: ['Augmenter ta masse musculaire de façon mesurable', 'Progresser sur les charges des mouvements clés', 'Optimiser le volume par groupe musculaire', 'Adapter ton alimentation à la prise de masse'],
      en: ['Increase muscle mass measurably', 'Progress on key lift loads', 'Optimise volume per muscle group', 'Adapt your diet to muscle gain'],
    },
    equipment: {
      fr: ['Accès à une salle de sport', 'Barre, disques et haltères', 'Banc réglable', 'Barre de traction'],
      en: ['Gym access', 'Barbell, plates and dumbbells', 'Adjustable bench', 'Pull-up bar'],
    },
    weekPlan: [
      day('strength', L('Push', 'Push'), 60),
      day('strength', L('Pull', 'Pull'), 60),
      REST,
      day('strength', L('Legs', 'Legs'), 60),
      day('strength', L('Upper Body', 'Upper Body'), 55),
      MOBILITY,
      REST,
    ],
    phases: makePhases('muscle-gain', 8),
    sessions: [push, pull, legs, upperBody],
  },
  {
    id: 'strength-mass',
    name: L('Strength & Mass', 'Strength & Mass'),
    tagline: L('Force maximale et volume : pour les pratiquants avancés.', 'Maximum strength and size: for advanced lifters.'),
    description: L(
      'Douze semaines de périodisation pour combiner gains de force et hypertrophie. Cinq séances par semaine, des cycles de charge planifiés et des tests de performance réguliers.',
      'Twelve weeks of periodisation combining strength gains and hypertrophy. Five sessions a week, planned loading cycles and regular performance tests.',
    ),
    goal: 'muscle-gain',
    level: 'advanced',
    plan: 'premium',
    location: 'gym',
    durationWeeks: 12,
    sessionsPerWeek: 5,
    sessionMinutes: 60,
    image: media.programs.strengthMass,
    coachId: 'karim',
    rating: 4.9,
    enrolled: 1460,
    popular: true,
    objectives: {
      fr: ['Battre tes records sur les mouvements de base', 'Gagner du volume sur tout le corps', 'Gérer la fatigue grâce à la périodisation', 'Suivre ta charge d’entraînement en détail'],
      en: ['Beat your records on the main lifts', 'Add size across your whole body', 'Manage fatigue with periodisation', 'Track your training load in detail'],
    },
    equipment: {
      fr: ['Salle équipée (rack, barre, disques)', 'Haltères lourds', 'Barre de traction', 'Ceinture de force (optionnel)'],
      en: ['Equipped gym (rack, barbell, plates)', 'Heavy dumbbells', 'Pull-up bar', 'Lifting belt (optional)'],
    },
    weekPlan: [
      day('strength', L('Push', 'Push'), 60),
      day('strength', L('Pull', 'Pull'), 60),
      day('strength', L('Legs', 'Legs'), 65),
      REST,
      day('strength', L('Upper Body', 'Upper Body'), 55),
      day('strength', L('Lower Body', 'Lower Body'), 55),
      REST,
    ],
    phases: makePhases('muscle-gain', 12),
    sessions: [push, pull, legs, upperBody, lowerBody],
  },
];

/* ==========================================================
   Catalogue vivant — remplacements Supabase pilotés par l'admin.
   `programs` est un export let : après syncProgramCatalog(), tous
   les consommateurs (listes, quiz, dashboard, admin) voient la
   version fusionnée sans changer d'API.
   - Seuls les champs édités sont stockés (payload = patch) puis
     fusionnés par-dessus le catalogue intégré : les ajouts futurs
     du code survivent aux éditions.
   - un programme masqué reste résolvable par id (membres déjà
     inscrits) mais disparaît des listes.
   ========================================================== */
export let programs: Program[] = DEFAULT_PROGRAMS;

const patches = new Map<string, Partial<Program>>();
const hiddenPrograms = new Set<string>();
const deletedPrograms = new Set<string>();
let catalogSync: Promise<boolean> | null = null;

function materialize(id: string): Program | null {
  if (deletedPrograms.has(id)) return null;
  const base = DEFAULT_PROGRAMS.find((program) => program.id === id) ?? null;
  const patch = patches.get(id);
  if (!base) return patch && 'id' in patch ? ({ ...(patch as Program) } as Program) : null;
  return patch ? { ...base, ...patch } : base;
}

function rebuildCatalog() {
  const merged = DEFAULT_PROGRAMS.filter((program) => !hiddenPrograms.has(program.id))
    .map((program) => materialize(program.id))
    .filter((program): program is Program => program !== null);
  for (const id of patches.keys()) {
    if (deletedPrograms.has(id)) continue;
    if (!DEFAULT_PROGRAMS.some((program) => program.id === id)) {
      const custom = materialize(id);
      if (custom) merged.push(custom);
    }
  }
  programs = merged;
}

export const getProgramById = (id: string | null | undefined): Program | null => {
  if (!id) return null;
  return materialize(id);
};

/** Catalogue complet pour le back-office (masqué inclus, supprimé exclu). */
export function getAllPrograms(): Program[] {
  const base = DEFAULT_PROGRAMS.map((program) => materialize(program.id)).filter(
    (program): program is Program => program !== null,
  );
  for (const id of patches.keys()) {
    if (deletedPrograms.has(id)) continue;
    if (!DEFAULT_PROGRAMS.some((program) => program.id === id)) {
      const custom = materialize(id);
      if (custom) base.push(custom);
    }
  }
  return base;
}

export function isProgramVisible(id: string): boolean {
  return !hiddenPrograms.has(id);
}

/** Des programmes ont été supprimés depuis le back-office ? (bouton « Rétablir ») */
export function hasDeletedPrograms(): boolean {
  return deletedPrograms.size > 0;
}

/** Charge les éditions admin depuis Supabase (idempotent, single-flight). */
export function syncProgramCatalog(): Promise<boolean> {
  catalogSync ??= (async () => {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { data, error } = await supabase.from('programs').select('id, payload, visible, deleted');
      if (error) {
        // PGRST205 = table absente (migration 0003 non exécutée) : on garde le catalogue intégré.
        console.warn('[programs] sync skipped:', error.message);
        return false;
      }
      for (const row of (data ?? []) as { id: string; payload: Partial<Program> | null; visible: boolean | null; deleted: boolean | null }[]) {
        if (row.deleted) {
          deletedPrograms.add(row.id);
          continue;
        }
        deletedPrograms.delete(row.id);
        if (row.visible === false) hiddenPrograms.add(row.id);
        else hiddenPrograms.delete(row.id);
        if (row.payload) patches.set(row.id, row.payload);
      }
      rebuildCatalog();
      return true;
    } catch (error) {
      console.warn('[programs] sync failed:', error);
      return false;
    }
  })();
  return catalogSync;
}

/** Sauvegarde l'édition d'un programme (Supabase, admin only via RLS). */
export async function saveProgramOverride(id: string, patch: Partial<Program>, visible: boolean): Promise<void> {
  if (!getProgramById(id)) throw new Error('unknown-program');
  if (!isSupabaseConfigured || !supabase) throw new Error('supabase-disabled');
  const { error } = await supabase
    .from('programs')
    .upsert({ id, payload: patch, visible, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  patches.set(id, patch);
  if (visible) hiddenPrograms.delete(id);
  else hiddenPrograms.add(id);
  rebuildCatalog();
}

/** Supprime l'édition : le programme redevient celui du catalogue intégré. */
export async function resetProgramOverride(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) throw new Error('supabase-disabled');
  const { error } = await supabase.from('programs').delete().eq('id', id);
  if (error) throw new Error(error.message);
  patches.delete(id);
  hiddenPrograms.delete(id);
  rebuildCatalog();
}

/**
 * Supprime un programme du catalogue (back-office) : partout pour tout
 * le monde, listes ET résolution par id. Tombstone en base — la
 * suppression de la ligne le rétablit.
 */
export async function deleteProgram(id: string): Promise<void> {
  if (!getProgramById(id)) throw new Error('unknown-program');
  if (!isSupabaseConfigured || !supabase) throw new Error('supabase-disabled');
  const { error } = await supabase
    .from('programs')
    .upsert({ id, payload: patches.get(id) ?? {}, visible: false, deleted: true, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  deletedPrograms.add(id);
  rebuildCatalog();
}

/** Rétablit tous les programmes supprimés (supprime leurs tombstones). */
export async function restoreDeletedPrograms(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) throw new Error('supabase-disabled');
  const { error } = await supabase.from('programs').delete().eq('deleted', true);
  if (error) throw new Error(error.message);
  deletedPrograms.clear();
  rebuildCatalog();
}

/** Supprime tout le catalogue (back-office), en un seul upsert. */
export async function deleteAllPrograms(): Promise<void> {
  const ids = getAllPrograms().map((program) => program.id);
  if (!ids.length) return;
  if (!isSupabaseConfigured || !supabase) throw new Error('supabase-disabled');
  const now = new Date().toISOString();
  const rows = ids.map((id) => ({ id, payload: patches.get(id) ?? {}, visible: false, deleted: true, updated_at: now }));
  const { error } = await supabase.from('programs').upsert(rows);
  if (error) throw new Error(error.message);
  for (const id of ids) deletedPrograms.add(id);
  rebuildCatalog();
}

/* ---------- Plans & pricing ---------- */
const FCFA_PER_EUR = 656;

export const planPricing: Record<Goal, Record<Plan, PlanPrice>> = {
  'muscle-gain': {
    standard: { monthly: Math.round(12.99 * FCFA_PER_EUR), yearlyMonthly: Math.round(9.99 * FCFA_PER_EUR) },
    premium: { monthly: Math.round(24.99 * FCFA_PER_EUR), yearlyMonthly: Math.round(19.99 * FCFA_PER_EUR) },
  },
  'weight-loss': {
    standard: { monthly: Math.round(9.99 * FCFA_PER_EUR), yearlyMonthly: Math.round(7.99 * FCFA_PER_EUR) },
    premium: { monthly: Math.round(19.99 * FCFA_PER_EUR), yearlyMonthly: Math.round(15.99 * FCFA_PER_EUR) },
  },
};

export const pricingFeatures: PricingFeature[] = [
  { label: L('Calculateurs IMC, calories & protéines', 'BMI, calorie & protein calculators'), free: true, standard: true, premium: true },
  { label: L('Bibliothèque d’exercices', 'Exercise library'), free: true, standard: true, premium: true },
  { label: L('Articles & recettes', 'Articles & recipes'), free: 'limited', standard: true, premium: true },
  { label: L('Programmes essentiels', 'Essential programs'), free: 'limited', standard: true, premium: true },
  { label: L('Suivi des séances & du poids', 'Session & weight tracking'), free: false, standard: true, premium: true },
  { label: L('Programmes complets & avancés', 'Complete & advanced programs'), free: false, standard: false, premium: true },
  { label: L('Plans alimentaires', 'Meal plans'), free: false, standard: false, premium: true },
  { label: L('Statistiques avancées', 'Advanced statistics'), free: false, standard: false, premium: true },
  { label: L('Recommandations personnalisées', 'Personalised recommendations'), free: false, standard: false, premium: true },
  { label: L('Contenus exclusifs', 'Exclusive content'), free: false, standard: false, premium: true },
];
