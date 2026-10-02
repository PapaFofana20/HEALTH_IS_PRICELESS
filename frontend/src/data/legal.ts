import type { Localized } from '../types';

/* ==========================================================
   CGU & Privacy policy (FR/EN).
   Drafted against Senegal's Loi n°2008-12 (personal data),
   the CDP, and international standards (GDPR-style rights).
   Have a lawyer review before production use.
   ========================================================== */

export interface LegalSection {
  heading: Localized;
  paragraphs: Localized[];
}

export interface LegalDoc {
  title: Localized;
  updated: Localized;
  sections: LegalSection[];
}

const L = (fr: string, en: string): Localized => ({ fr, en });

export const cgu: LegalDoc = {
  title: L('Conditions Générales d’Utilisation', 'Terms of Use'),
  updated: L('Dernière mise à jour : février 2026', 'Last updated: February 2026'),
  sections: [
    {
      heading: L('1. Objet', '1. Purpose'),
      paragraphs: [
        L(
          'HEALTH IS PRICELESS propose des programmes d’entraînement, des outils nutritionnels et un suivi de progression. Les présentes CGU encadrent l’accès et l’utilisation de la plateforme.',
          'HEALTH IS PRICELESS provides training programs, nutrition tools and progress tracking. These Terms govern access to and use of the platform.',
        ),
      ],
    },
    {
      heading: L('2. Compte et accès', '2. Account and access'),
      paragraphs: [
        L(
          'La création d’un compte exige des informations exactes. Tu es responsable de la confidentialité de ton mot de passe et des activités menées depuis ton compte.',
          'Creating an account requires accurate information. You are responsible for keeping your password confidential and for activity under your account.',
        ),
        L(
          'L’achat d’une formule (Standard, Premium) est réservé aux utilisateurs connectés. Les formules sont sans engagement et résiliables à tout moment depuis tes paramètres.',
          'Buying a plan (Standard, Premium) requires being logged in. Plans have no commitment and can be cancelled anytime from your settings.',
        ),
      ],
    },
    {
      heading: L('3. Santé et sécurité', '3. Health and safety'),
      paragraphs: [
        L(
          'Les contenus (séances, calculateurs, conseils) sont fournis à titre informatif et ne remplacent pas l’avis d’un professionnel de santé. Consulte un médecin avant de débuter un programme, surtout en cas de pathologie, grossesse ou douleur.',
          'Content (workouts, calculators, advice) is informational only and does not replace professional medical advice. Consult a doctor before starting, especially with any condition, pregnancy or pain.',
        ),
        L(
          'Arrête immédiatement tout exercice en cas de douleur, vertige ou malaise, et adapte les charges à ton niveau.',
          'Stop any exercise immediately in case of pain, dizziness or discomfort, and adapt loads to your level.',
        ),
      ],
    },
    {
      heading: L('4. Utilisation acceptable', '4. Acceptable use'),
      paragraphs: [
        L(
          'Sont interdits : le partage de compte à grande échelle, la revente des contenus, l’automatisation abusive (scraping), toute tentative d’intrusion et tout contenu illicite ou portant atteinte à autrui.',
          'Prohibited: large-scale account sharing, reselling content, abusive automation (scraping), intrusion attempts, and any unlawful or harmful content.',
        ),
      ],
    },
    {
      heading: L('5. Propriété intellectuelle', '5. Intellectual property'),
      paragraphs: [
        L(
          'Textes, programmes, visuels et marques HEALTH IS PRICELESS restent notre propriété exclusive. Toute reproduction sans autorisation écrite est interdite.',
          'HEALTH IS PRICELESS texts, programs, visuals and trademarks remain our exclusive property. Reproduction without written permission is prohibited.',
        ),
      ],
    },
    {
      heading: L('6. Résiliation', '6. Termination'),
      paragraphs: [
        L(
          'Tu peux supprimer ton compte à tout moment (tes données personnelles sont alors effacées). Nous pouvons suspendre un compte en cas de violation des présentes CGU.',
          'You may delete your account anytime (your personal data is then erased). We may suspend accounts breaching these Terms.',
        ),
      ],
    },
    {
      heading: L('7. Droit applicable', '7. Governing law'),
      paragraphs: [
        L(
          'Les présentes CGU sont régies par le droit sénégalais. En cas de litige, les parties privilégient le règlement amiable, à défaut les juridictions compétentes de Dakar.',
          'These Terms are governed by Senegalese law. Disputes go first to amicable resolution, otherwise the competent courts of Dakar.',
        ),
      ],
    },
  ],
};

export const privacy: LegalDoc = {
  title: L('Politique de confidentialité', 'Privacy Policy'),
  updated: L('Dernière mise à jour : février 2026', 'Last updated: February 2026'),
  sections: [
    {
      heading: L('1. Cadre légal', '1. Legal framework'),
      paragraphs: [
        L(
          'Le traitement de tes données respecte la loi sénégalaise n°2008-12 du 25 janvier 2008 sur la protection des données personnelles, sous le contrôle de la CDP (Commission de Protection des Données Personnelles), ainsi que les standards internationaux de type RGPD pour nos utilisateurs hors Sénégal.',
          'We process your data under Senegal’s Loi n°2008-12 of 25 January 2008 on personal data, overseen by the CDP, plus GDPR-style international standards for users outside Senegal.',
        ),
      ],
    },
    {
      heading: L('2. Données collectées', '2. Data we collect'),
      paragraphs: [
        L(
          'Compte : prénom, email, mot de passe (chiffré), objectif. Usage : programme suivi, séances, poids et tailles saisis dans les calculateurs. Technique : langue choisie, préférences stockées localement sur ton appareil.',
          'Account: first name, email, (hashed) password, goal. Usage: followed program, sessions, weights and sizes entered in calculators. Technical: chosen language, preferences stored locally on your device.',
        ),
      ],
    },
    {
      heading: L('3. Finalités et consentement', '3. Purposes and consent'),
      paragraphs: [
        L(
          'Tes données servent uniquement à fournir le service : compte, programmes, suivi, support. En cochant la case d’acceptation à l’inscription, tu consens à ces traitements. Tu peux retirer ton consentement en supprimant ton compte.',
          'Your data is used only to provide the service: account, programs, tracking, support. By ticking the acceptance box at signup you consent to this processing. You may withdraw consent by deleting your account.',
        ),
      ],
    },
    {
      heading: L('4. Conservation', '4. Retention'),
      paragraphs: [
        L(
          'Données de compte : conservées tant que le compte est actif, puis effacées sous 30 jours après suppression. Mesures et journaux : effacés avec le compte. Sauvegardes techniques : purgées sous 90 jours.',
          'Account data: kept while the account is active, erased within 30 days of deletion. Measurements and logs: erased with the account. Technical backups: purged within 90 days.',
        ),
      ],
    },
    {
      heading: L('5. Partage et transferts', '5. Sharing and transfers'),
      paragraphs: [
        L(
          'Tes données ne sont jamais revendues. Elles ne sont partagées qu’avec nos prestataires strictement nécessaires (hébergement, paiement) et, le cas échéant, transférées hors Sénégal avec des garanties appropriées.',
          'Your data is never sold. It is shared only with strictly necessary providers (hosting, payment) and, if transferred outside Senegal, with appropriate safeguards.',
        ),
      ],
    },
    {
      heading: L('6. Tes droits', '6. Your rights'),
      paragraphs: [
        L(
          'Droit d’accès, de rectification, de suppression, d’opposition et de portabilité : écris à contact@forge.app, réponse sous 30 jours. Tu peux aussi déposer une plainte auprès de la CDP (Sénégal) ou de ton autorité locale.',
          'Rights of access, rectification, erasure, objection and portability: write to contact@forge.app, answered within 30 days. You may also complain to the CDP (Senegal) or your local authority.',
        ),
      ],
    },
    {
      heading: L('7. Sécurité', '7. Security'),
      paragraphs: [
        L(
          'Mots de passe chiffrés, connexions sécurisées (HTTPS), accès internes limités. Aucun système n’est infaillible : signale toute anomalie à contact@forge.app.',
          'Hashed passwords, secure connections (HTTPS), restricted internal access. No system is flawless: report anything suspicious to contact@forge.app.',
        ),
      ],
    },
    {
      heading: L('8. Mineurs et cookies', '8. Minors and cookies'),
      paragraphs: [
        L(
          'Le service s’adresse aux personnes de 15 ans et plus ; l’accord d’un parent est requis en dessous. Nous n’utilisons que des stockages techniques locaux (langue, session) : aucun cookie publicitaire ou traceur tiers.',
          'The service targets users aged 15+; parental consent is required below. We use only local technical storage (language, session): no advertising cookies or third-party trackers.',
        ),
      ],
    },
  ],
};
