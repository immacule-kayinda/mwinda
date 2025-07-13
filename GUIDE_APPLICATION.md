# Mwinda - Guide Complet de l'Application

## 📋 Vue d'ensemble

**Mwinda** est une application de réservation de trajet moderne, inspirée des plateformes comme Yango et Uber, spécialement conçue pour le marché congolais. L'application permet aux utilisateurs de réserver des trajets en temps réel avec une interface intuitive et des fonctionnalités avancées.

### 🎯 Objectifs de l'application

- **Simplicité d'utilisation** : Interface claire et intuitive
- **Géolocalisation précise** : Détection automatique de la position
- **Calcul d'itinéraires** : Optimisation des trajets
- **Historique complet** : Suivi des réservations
- **Informations détaillées** : Données du conducteur et du véhicule

## 🚀 Fonctionnalités Principales

### 1. **Système d'Authentification**
- Inscription et connexion sécurisées
- Gestion des sessions utilisateur
- Protection des données personnelles

### 2. **Réservation de Trajet**
- **Géolocalisation automatique** : Détection de la position actuelle
- **Autocomplétion d'adresses** : Recherche intelligente des destinations
- **Validation en temps réel** : Vérification des données saisies
- **Calcul d'itinéraire** : Optimisation du trajet le plus rapide
- **Estimation de prix** : Calcul automatique basé sur la distance

### 3. **Carte Interactive**
- **Affichage en temps réel** : Carte Mapbox haute performance
- **Visualisation d'itinéraire** : Trajet tracé sur la carte
- **Informations détaillées** : Distance, durée, mode de transport
- **Interface responsive** : Adaptation mobile et desktop

### 4. **Gestion des Conducteurs**
- **Simulation de recherche** : Trouver un conducteur disponible
- **Informations complètes** : Nom, téléphone, véhicule, plaque
- **Acceptation/Refus** : Interface de réponse du conducteur
- **Estimation d'arrivée** : Temps d'attente calculé

### 5. **Historique des Réservations**
- **Stockage persistant** : Base de données PostgreSQL
- **Informations détaillées** : Statut, dates, conducteur assigné
- **Filtrage par statut** : En attente, confirmé, terminé, annulé
- **Interface intuitive** : Navigation par onglets

## 🛠️ Technologies Utilisées

### **Frontend**
- **Next.js 15** : Framework React moderne avec App Router
  - *Pourquoi* : Performance optimale, SSR/SSG, routing avancé
- **TypeScript** : Typage statique pour la robustesse
  - *Pourquoi* : Détection d'erreurs précoce, meilleure DX


### **Styling & UI**
- **Tailwind CSS 4** : Framework CSS utilitaire
  - *Pourquoi* : Développement rapide, personnalisation facile
- **shadcn/ui** : Composants UI réutilisables
  - *Pourquoi* : Design system cohérent, accessibilité
- **Lucide React** : Icônes modernes et légères
  - *Pourquoi* : Cohérence visuelle, performance

### **Formulaires & Validation**
- **React Hook Form** : Gestion de formulaires performante
  - *Pourquoi* : Moins de re-renders, validation optimisée
- **Zod** : Validation de schémas TypeScript
  - *Pourquoi* : Type safety, validation runtime robuste

### **Cartographie**
- **Mapbox GL JS** : Cartes interactives haute performance
  - *Pourquoi* : Rendu vectoriel, personnalisation avancée
- **API Mapbox** : Géocodage et calcul d'itinéraires
  - *Pourquoi* : Précision mondiale, données à jour

### **Base de Données**
- **PostgreSQL** : Base de données relationnelle robuste
  - *Pourquoi* : Fiabilité, performances, fonctionnalités avancées
- **Prisma ORM** : Client de base de données type-safe
  - *Pourquoi* : Productivité, migrations automatiques

### **Authentification**
- **NextAuth.js** : Solution d'authentification complète
  - *Pourquoi* : Sécurité, intégration facile, providers multiples

### **Déploiement**
- **Vercel** : Plateforme de déploiement optimisée
  - *Pourquoi* : Intégration Next.js, performance globale

## 📱 Guide d'Utilisation

### **1. Première Connexion**

1. **Accédez à l'application** via votre navigateur
2. **Cliquez sur "Profil"** dans la barre de navigation
3. **Créez un compte** avec votre email et mot de passe
4. **Remplissez vos informations** : nom, téléphone
5. **Validez votre inscription**

### **2. Effectuer une Réservation**

1. **Onglet "Réserver"** : Accédez au formulaire principal
2. **Autorisez la géolocalisation** : L'application détecte votre position
3. **Remplissez vos informations** :
   - Nom complet (pré-rempli si connecté)
   - Numéro de téléphone
4. **Saisissez votre destination** :
   - Utilisez l'autocomplétion pour les adresses
   - Exemples : "Muanda", "Matadi", "Kasumbalesa"
5. **Cliquez sur "Réserver"**

### **3. Visualiser l'Itinéraire**

1. **Onglet "Carte"** : Visualisez le trajet calculé
2. **Informations affichées** :
   - Distance en kilomètres
   - Durée estimée du trajet
   - Prix calculé automatiquement
3. **Interagissez avec la carte** : Zoom, déplacement

### **4. Gérer la Réservation**

1. **Attendez la réponse du conducteur** (simulation)
2. **Informations du conducteur** :
   - Nom et téléphone
   - Modèle et plaque du véhicule
   - Temps d'arrivée estimé
3. **Acceptez ou refusez** le conducteur proposé

### **5. Consulter l'Historique**

1. **Onglet "Historique"** : Accédez à vos réservations
2. **Filtres disponibles** :
   - En attente (jaune)
   - Confirmé (vert)
   - Terminé (bleu)
   - Annulé (rouge)
3. **Informations détaillées** :
   - Date et heure de création
   - Points de départ et d'arrivée
   - Informations du conducteur assigné
   - Prix et distance

## 🔧 Configuration Technique

### **Variables d'Environnement**

```env
# Base de données
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentification
NEXTAUTH_URL="https://votre-domaine.vercel.app"
NEXTAUTH_SECRET="votre-secret-ici"

# Cartographie
NEXT_PUBLIC_MAPBOX_TOKEN="pk.votre_token_mapbox"
```

### **Structure de la Base de Données**

```sql
-- Table des utilisateurs
User {
  id: String (CUID)
  email: String (unique)
  name: String
  password: String (hashé)
  phone: String
  createdAt: DateTime
  updatedAt: DateTime
}

-- Table des réservations
Booking {
  id: String (CUID)
  userId: String (référence User)
  name: String
  phone: String
  departure: String
  arrival: String
  departureCoords: String?
  arrivalCoords: String?
  distance: Float?
  duration: Int?
  price: Float?
  status: String (pending/confirmed/completed/cancelled)
  driverName: String?
  driverPhone: String?
  driverCar: String?
  driverPlate: String?
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 🚀 Déploiement

### **Déploiement sur Vercel**

1. **Connectez votre repository** GitHub à Vercel
2. **Configurez les variables d'environnement** :
   - `DATABASE_URL` : URL PostgreSQL
   - `NEXTAUTH_URL` : URL de votre application
   - `NEXTAUTH_SECRET` : Secret de sécurité
   - `NEXT_PUBLIC_MAPBOX_TOKEN` : Token Mapbox
3. **Déployez automatiquement** : Vercel détecte les changements

### **Configuration de la Base de Données**

1. **Créez une base PostgreSQL** (Vercel Postgres recommandé)
2. **Configurez Prisma** :
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. **Vérifiez la connexion** : Testez les migrations

## 🔒 Sécurité

### **Mesures Implémentées**

- **Authentification sécurisée** : NextAuth.js avec hachage bcrypt
- **Validation des données** : Zod pour la validation côté client et serveur
- **Protection CSRF** : Tokens de sécurité automatiques
- **Variables d'environnement** : Secrets non exposés dans le code
- **HTTPS obligatoire** : Chiffrement des communications

### **Bonnes Pratiques**

- **Mots de passe forts** : Validation côté client et serveur
- **Sessions sécurisées** : Gestion automatique par NextAuth
- **Validation d'entrées** : Protection contre les injections
- **Rate limiting** : Protection contre les abus

## 📊 Performance

### **Optimisations Implémentées**

- **SSR/SSG** : Rendu côté serveur pour le SEO
- **Lazy loading** : Chargement différé des composants
- **Optimisation des images** : Next.js Image component
- **Bundle splitting** : Code splitting automatique
- **Caching intelligent** : Cache des requêtes API

## 🐛 Dépannage

### **Problèmes Courants**

**Erreur de géolocalisation**
- Vérifiez les permissions du navigateur
- Assurez-vous d'être sur HTTPS en production
- Testez sur un appareil mobile

**Erreur de base de données**
- Vérifiez la variable `DATABASE_URL`
- Assurez-vous que PostgreSQL est accessible
- Vérifiez les migrations Prisma

**Erreur Mapbox**
- Vérifiez le token `NEXT_PUBLIC_MAPBOX_TOKEN`
- Assurez-vous que le token a les bonnes permissions
- Vérifiez les quotas d'utilisation

### **Logs et Debugging**

```bash
# Mode développement avec logs détaillés
npm run dev

# Vérifier les migrations Prisma
npx prisma migrate status

# Générer le client Prisma
npx prisma generate

# Ouvrir Prisma Studio
npx prisma studio
```
