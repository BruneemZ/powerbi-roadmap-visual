# Visuel Power BI - Roadmap Projet

Un visuel Power BI personnalisé pour afficher une roadmap de projet interactive de type Gantt.

## Fonctionnalités

- Affichage des tâches sous forme de barres temporelles
- Support des dates de début et de fin
- Indicateur de progression pour chaque tâche
- Catégorisation par couleur
- Grille temporelle configurable
- Hauteur de barres ajustable

## Structure des données

Le visuel attend les champs suivants dans Power BI :

| Champ | Type | Description |
|-------|------|-------------|
| Tâche | Texte | Nom de la tâche ou du jalon |
| Date de début | Date | Date de début de la tâche |
| Date de fin | Date | Date de fin prévue |
| Catégorie | Texte | Catégorie pour le groupement et les couleurs |
| Progression | Nombre | Pourcentage de progression (0-100) |

## Développement

### Prérequis

- Node.js (v18+)
- npm
- Power BI Desktop

### Installation

1. Cloner le projet
2. Installer les dépendances :
```bash
npm install
```

### Compilation

Pour compiler le projet TypeScript :
```bash
npm run build
```

### Installation de Power BI Visual Tools (global)

Pour pouvoir packager et tester le visuel, vous devez installer `powerbi-visuals-tools` globalement :

```bash
sudo npm install -g powerbi-visuals-tools
```

Une fois installé, vous devrez créer un certificat SSL pour le développement :

```bash
pbiviz --install-cert
```

### Développement en mode Live

Pour démarrer le serveur de développement et tester le visuel en temps réel :

```bash
pbiviz start
```

Puis dans Power BI Desktop :
1. Aller dans Fichier > Options et paramètres > Options
2. Activer "Visuels de développeur" dans la section Aperçu
3. Redémarrer Power BI Desktop
4. Le visuel apparaîtra dans le volet des visualisations avec une icône de développeur

### Packaging

Pour créer un fichier .pbiviz à importer dans Power BI :

```bash
pbiviz package
```

Le fichier sera créé dans le dossier `dist/`.

## Importation dans Power BI

1. Packager le visuel avec `pbiviz package`
2. Dans Power BI Desktop, cliquer sur les trois points (...) dans le volet Visualisations
3. Sélectionner "Importer un visuel à partir d'un fichier"
4. Sélectionner le fichier `.pbiviz` généré dans le dossier `dist/`

## Configuration

### Paramètres disponibles

- **Hauteur des barres** : Ajuster la hauteur des barres de tâches (20-100px)
- **Afficher la grille** : Activer/désactiver la grille temporelle

## Structure du projet

```
powerbi-roadmap-visual/
├── .api/                  # Définitions TypeScript Power BI API
├── assets/                # Ressources (icônes, etc.)
├── src/
│   ├── visual.ts         # Code principal du visuel
│   └── settings.ts       # Configuration des paramètres
├── style/
│   └── visual.less       # Styles CSS/LESS
├── capabilities.json     # Définition des capacités du visuel
├── pbiviz.json          # Configuration du visuel
├── tsconfig.json        # Configuration TypeScript
└── package.json         # Dépendances npm
```

## Personnalisation

### Modifier les couleurs

Les couleurs sont définies automatiquement via D3.js (`d3.schemeCategory10`). Pour personnaliser :

Éditez `src/visual.ts` ligne ~109 :
```typescript
const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
```

### Ajouter des paramètres

1. Ajouter les propriétés dans `capabilities.json`
2. Créer les contrôles dans `src/settings.ts`
3. Utiliser les valeurs dans `src/visual.ts`

## Licence

MIT

## Support

Pour tout problème ou question, veuillez ouvrir une issue sur le dépôt du projet.
