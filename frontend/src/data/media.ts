/* ==========================================================
   Centralised media URLs (Pexels + randomuser portraits).
   Replace with your CDN / Supabase Storage later.
   ========================================================== */

const px = (id: number, w = 1200, h = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=${h}&w=${w}`;

export const avatar = (gender: 'men' | 'women', n: number) => `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;

export const unsplash = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;

const un = unsplash;

export const media = {
  goals: {
    weightLoss: px(6455787, 1100, 1300),
    muscleGain: px(5327456, 1100, 1300),
  },
  programs: {
    fatBurn: px(8173428, 900, 675),
    transformation: px(6388379, 900, 675),
    leanStrong: px(17898140, 900, 675),
    hiitShred: px(7675409, 900, 675),
    massFoundations: px(4720793, 900, 675),
    homeHypertrophy: px(8173436, 900, 675),
    muscleBuilder: px(18060117, 900, 675),
    strengthMass: px(5327472, 900, 675),
  },
  exercises: {
    squat: px(4720780, 800, 600),
    benchPress: px(4720782, 800, 600),
    pushUp: px(7188064, 800, 600),
    burpee: px(6388464, 800, 600),
    lunge: px(5310785, 800, 600),
    pullUp: px(5327456, 800, 600),
    plank: px(4920466, 800, 600),
    deadlift: px(4853280, 800, 600),
    mountainClimber: px(30246182, 800, 600),
    dumbbellRow: px(4720773, 800, 600),
    shoulderPress: px(4720794, 800, 600),
    kettlebellSwing: px(8611417, 800, 600),
    bicepCurl: px(19132573, 800, 600),
  },
  recipes: {
    overnightOats: un('photo-1756457892871-88522afffbdc', 800, 560),
    omelette: un('photo-1510693206972-df098062cb71', 800, 560),
    chickenBowl: un('photo-1762631383846-6bead15b9796', 800, 560),
    lentilSalad: un('photo-1748444432939-f5e117280ab0', 800, 560),
    salmon: un('photo-1762098457195-aa2185a2330e', 800, 560),
    beefRice: un('photo-1761064864532-1794a1f8f784', 800, 560),
    tofuBowl: un('photo-1769031240699-e15f4818224a', 800, 560),
    skyr: un('photo-1648912607168-88b8db633771', 800, 560),
    shake: un('photo-1626668934174-edba98195dbf', 800, 560),
  },
  articles: {
    weightLossMistakes: px(35419772, 1200, 750),
    protein: px(9213918, 1200, 750),
    startTraining: px(4853280, 1200, 750),
    cardioVsWeights: px(6388450, 1200, 750),
    cardioBattle: px(6551174, 1200, 750),
    proteinSources: px(5966441, 1200, 750),
    restBeach: px(4643919, 1200, 750),
    homeWorkout: px(23224739, 1200, 750),
    benchPress: px(4720782, 1200, 750),
    sleep: px(3771069, 1200, 750),
  },
  community: [px(6388379, 420, 420), px(18060117, 420, 420), px(7529022, 420, 420)],
  nutritionHero: px(7660437, 1600, 900),
  aboutHero: px(4853280, 1600, 900),
  exercisesHero: px(5327472, 1600, 900),
  articlesHero: px(6388450, 1600, 900),
  aboutMission: px(8173428, 1000, 1100),
  authSide: px(17898140, 1100, 1500),
};
