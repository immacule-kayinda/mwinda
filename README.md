# Mwinda - Application de Réservation de Trajet

Une application MVP de réservation de trajet type Yango/Uber, construite avec Next.js, TypeScript, et Mapbox.

## Fonctionnalités

- ✅ Formulaire de réservation avec validation
- ✅ Carte interactive Mapbox avec affichage d'itinéraire
- ✅ Simulation de recherche de conducteur
- ✅ Historique des trajets avec stockage local
- ✅ Interface utilisateur moderne avec shadcn/ui

## Installation

1. Clonez le repository
2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez votre token Mapbox :
   - Créez un compte sur [Mapbox](https://www.mapbox.com/)
   - Obtenez votre token d'accès
   - Créez un fichier `.env.local` à la racine du projet :
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=votre_token_mapbox_ici
   ```

4. Lancez l'application :
   ```bash
   npm run dev
   ```

## Structure du Projet

```
src/
├── app/                    # Pages Next.js
├── components/             # Composants React
│   ├── ui/                # Composants shadcn/ui
│   ├── BookingForm.tsx    # Formulaire de réservation
│   ├── MapBox.tsx         # Carte interactive
│   ├── DriverResponse.tsx # Réponse du conducteur
│   ├── BookingHistory.tsx # Historique des trajets
│   └── MwindaApp.tsx      # Composant principal
└── lib/                   # Utilitaires
    ├── mapbox.ts          # Service Mapbox
    └── storage.ts         # Gestion du stockage local
```

## Utilisation

1. **Réservation** : Remplissez le formulaire avec vos informations et adresses
2. **Carte** : Visualisez l'itinéraire calculé entre les points
3. **Conducteur** : Acceptez ou appelez le conducteur simulé
4. **Historique** : Consultez vos trajets précédents

## Technologies Utilisées

- **Next.js 15** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **shadcn/ui** - Composants UI
- **Mapbox GL JS** - Cartes interactives
- **React Hook Form** - Gestion de formulaires
- **Zod** - Validation de schémas
- **Lucide React** - Icônes

## Configuration Mapbox

L'application utilise l'API Mapbox pour :
- Géocodage des adresses
- Calcul d'itinéraires
- Affichage de cartes interactives

Assurez-vous d'avoir un token Mapbox valide avec les permissions appropriées.

## Développement

```bash
# Lancer en mode développement
npm run dev

# Build de production
npm run build

# Lancer en production
npm start
```

## Fonctionnalités Futures

- [ ] Authentification utilisateur
- [ ] Géolocalisation automatique
- [ ] Estimation de prix
- [ ] Notifications push
- [ ] Paiement intégré
- [ ] Système de notation
