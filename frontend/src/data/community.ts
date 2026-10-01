import type { Challenge, Testimonial } from '../types';
import { avatar, media } from './media';

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Awa Diop',
    age: 34,
    goal: 'weight-loss',
    programId: 'fat-burn-starter',
    rating: 5,
    duration: { fr: '6 semaines', en: '6 weeks' },
    quote: {
      fr: 'J’ai enfin réussi à suivre un programme plus de trois semaines. Le suivi rend les objectifs beaucoup plus simples à comprendre.',
      en: 'I finally managed to stick to a program for more than three weeks. The tracking makes goals so much easier to understand.',
    },
  },
  {
    id: 't2',
    name: 'Moussa Diallo',
    age: 27,
    goal: 'muscle-gain',
    programId: 'muscle-builder',
    rating: 5,
    duration: { fr: '8 semaines', en: '8 weeks' },
    quote: {
      fr: 'Je savais m’entraîner, pas progresser. Avec des séances claires et des charges notées, je vois enfin mes chiffres avancer semaine après semaine.',
      en: 'I knew how to train, not how to progress. With clear sessions and logged loads, I finally see my numbers move week after week.',
    },
  },
  {
    id: 't3',
    name: 'Fatou Ndiaye',
    age: 41,
    goal: 'weight-loss',
    programId: 'lean-and-strong',
    rating: 5,
    duration: { fr: '3 mois', en: '3 months' },
    quote: {
      fr: 'Des séances bien construites et un planning clair : c’est devenu une routine que je ne lâche plus, même avec un emploi du temps chargé.',
      en: 'Well-built sessions and a clear schedule: it’s become a routine I stick to, even with a busy calendar.',
    },
  },
  {
    id: 't4',
    name: 'Cheikh Sarr',
    age: 31,
    goal: 'muscle-gain',
    programId: 'strength-mass',
    rating: 4,
    duration: { fr: '12 semaines', en: '12 weeks' },
    quote: {
      fr: 'Le calculateur de protéines et les recettes m’ont aidé à structurer mes repas sans me prendre la tête.',
      en: 'The protein calculator and the recipes helped me structure my meals without overthinking it.',
    },
  },
  {
    id: 't5',
    name: 'Mariama Bah',
    age: 25,
    goal: 'weight-loss',
    programId: 'transformation-30',
    rating: 5,
    duration: { fr: '30 jours', en: '30 days' },
    quote: {
      fr: 'Les séances HIIT sont exigeantes mais bien dosées. J’apprécie de pouvoir alterner entre la maison et la salle.',
      en: 'The HIIT sessions are tough but well balanced. I love being able to switch between home and the gym.',
    },
  },
  {
    id: 't6',
    name: 'Ibrahima Sow',
    age: 38,
    goal: 'muscle-gain',
    programId: 'home-hypertrophy',
    rating: 5,
    duration: { fr: '6 semaines', en: '6 weeks' },
    quote: {
      fr: 'Pas de salle près de chez moi : avec des haltères et des élastiques, le programme maison est vraiment complet.',
      en: 'No gym near me: with dumbbells and bands, the home program is genuinely complete.',
    },
  },
];

export const communityAvatars: string[] = [
  avatar('men', 11),
  avatar('women', 21),
  avatar('men', 22),
  avatar('women', 33),
  avatar('men', 41),
];

export const communityImages: string[] = media.community;

export const communityMembers = 25;

export const weeklyChallenge: Challenge = {
  title: { fr: '10 000 pas / jour', en: '10,000 steps / day' },
  description: {
    fr: 'Marche au moins 10 000 pas chaque jour pendant 7 jours.',
    en: 'Walk at least 10,000 steps every day for 7 days.',
  },
  participants: 1248,
  daysLeft: 4,
  progress: 62,
};
