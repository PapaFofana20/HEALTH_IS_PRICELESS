# HIP Backend

Backend API pour la plateforme HIP - Health Is Pristine.

## Démarrage

```bash
cd backend
npm install
npm run dev
```

Le serveur démarre sur http://localhost:3001

## Endpoints API

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur

### Programmes
- `GET /api/programs` - Liste des programmes
- `GET /api/programs/:id` - Détail d'un programme

### Exercices
- `GET /api/exercises` - Liste des exercices
- `GET /api/exercises/:id` - Détail d'un exercice

### Recettes
- `GET /api/recipes` - Liste des recettes
- `GET /api/recipes/:id` - Détail d'une recette

### Articles
- `GET /api/articles` - Liste des articles
- `GET /api/articles/:id` - Détail d'un article

### Utilisateurs
- `GET /api/users/:userId` - Profil utilisateur
- `PATCH /api/users/:userId` - Mise à jour profil
- `POST /api/users/:userId/favorites/:programId` - Toggle favori
- `GET /api/users/:userId/favorites` - Liste favoris
- `POST /api/users/:userId/start-program` - Démarrer un programme

### Nutrition
- `GET /api/nutrition/tips` - Conseils nutrition
- `GET /api/nutrition/meal-plans` - Plans repas

### Communauté
- `GET /api/community/testimonials` - Témoignages
- `GET /api/community/challenges` - Défis

### Pricing
- `GET /api/pricing` - Plans tarifaires

## Authentification

Inclure le token JWT dans le header `Authorization: Bearer <token>`
