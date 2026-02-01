# Guide de Test - Visuel Roadmap Power BI

## Fichier à Tester

**Fichier généré:**
```
dist/roadmapVisual49E8F2A1D3B6C5E7.1.0.0.0.pbiviz (28 Ko)
```

## Préparation

### 1. Télécharger Power BI Desktop

Si ce n'est pas déjà fait, téléchargez gratuitement:
- [Power BI Desktop](https://www.microsoft.com/fr-fr/power-platform/products/power-bi/desktop)

### 2. Préparer les données

Vous avez 2 options:

**Option A: Utiliser le fichier d'exemple**
- Le fichier `exemple-donnees.csv` est prêt à l'emploi

**Option B: Créer vos propres données**
- Créez un fichier Excel ou CSV avec ces colonnes:
  - Tâche (texte)
  - Date de début (date au format JJ/MM/AAAA)
  - Date de fin (date au format JJ/MM/AAAA)
  - Catégorie (texte)
  - Progression (nombre de 0 à 100)

## Test du Visuel

### Étape 1: Importer le Visuel dans Power BI

1. Ouvrir Power BI Desktop
2. Dans le volet **Visualisations** (à droite):
   - Cliquer sur les **trois points (...)** en haut
   - Sélectionner **Importer un visuel à partir d'un fichier**
   - Naviguer vers `dist/roadmapVisual49E8F2A1D3B6C5E7.1.0.0.0.pbiviz`
   - Cliquer **Ouvrir**
3. Accepter l'avertissement de sécurité
4. Un nouveau bouton apparaît dans les visualisations avec une icône personnalisée

### Étape 2: Charger les Données

1. Dans Power BI Desktop:
   - **Obtenir des données** > **Texte/CSV**
   - Sélectionner `exemple-donnees.csv`
   - Cliquer **Charger**
2. Les données apparaissent dans le volet **Données** (à droite)

### Étape 3: Créer la Visualisation

1. Cliquer sur l'icône du visuel Roadmap dans le volet Visualisations
2. Un espace de visualisation vide apparaît sur le canevas
3. Faire glisser les champs vers les zones appropriées:

   ```
   Zone "Tâche" → Faire glisser le champ "Tâche"
   Zone "Date de début" → Faire glisser "Date de début"
   Zone "Date de fin" → Faire glisser "Date de fin"
   Zone "Catégorie" → Faire glisser "Catégorie"
   Zone "Progression (%)" → Faire glisser "Progression"
   ```

4. La roadmap s'affiche immédiatement!

### Étape 4: Tester les Fonctionnalités

#### A. Tooltips (Info-bulles)
- Survoler une barre de tâche
- Une info-bulle devrait apparaître avec:
  - Nom de la tâche
  - Catégorie
  - Dates de début et fin
  - Durée en jours
  - Pourcentage de progression

#### B. Effet de Survol
- Survoler différentes tâches
- Observer:
  - La barre devient plus lumineuse
  - Un contour apparaît
  - Le texte devient gras

#### C. Légende
- Vérifier que les catégories sont affichées en haut à droite
- Chaque catégorie a sa couleur

#### D. Progression
- Les barres avec progression élevée sont remplies davantage
- Les barres avec 0% ne montrent que le fond transparent

### Étape 5: Personnaliser le Visuel

1. Cliquer sur l'icône **Pinceau** (Format) dans le volet Visualisations
2. Développer **Paramètres Roadmap**
3. Tester les options:

   **Hauteur des barres:**
   - Ajuster le curseur (20-100)
   - Observer le changement en temps réel

   **Afficher la grille:**
   - Activer/désactiver
   - Les lignes verticales apparaissent/disparaissent

### Étape 6: Redimensionner

1. Sélectionner le visuel
2. Redimensionner en utilisant les poignées
3. Vérifier que:
   - Le visuel s'adapte correctement
   - Les textes restent lisibles
   - Les proportions sont maintenues

## Scénarios de Test

### Test 1: Petit jeu de données
- ✅ Données d'exemple (9 tâches)
- ✅ Doit s'afficher sans problème

### Test 2: Dates variées
- Créer des tâches avec:
  - Tâches courtes (1 jour)
  - Tâches longues (3 mois)
  - Tâches qui se chevauchent
- Vérifier que toutes s'affichent correctement

### Test 3: Catégories multiples
- Créer 5-6 catégories différentes
- Vérifier que chaque catégorie a une couleur unique
- Vérifier que la légende est lisible

### Test 4: Progression variable
- Tester avec 0%, 50%, 100%
- Vérifier que la barre de progression est proportionnelle

### Test 5: Filtres Power BI
1. Ajouter un segment (slicer) pour la Catégorie
2. Filtrer par catégorie
3. Vérifier que le visuel se met à jour

## Problèmes Connus et Solutions

### Le visuel ne s'affiche pas
- **Cause:** Données manquantes
- **Solution:** Vérifier que tous les champs requis sont mappés

### Les dates sont incorrectes
- **Cause:** Format de date non reconnu
- **Solution:** Dans Power BI, clic droit sur la colonne > Modifier le type > Date

### Les couleurs se répètent
- **Solution:** Normal si plus de 10 catégories. Réduire le nombre de catégories ou personnaliser les couleurs dans le code

### Le texte est tronqué
- **Solution:** Augmenter la largeur du visuel ou réduire la taille des noms de tâches

## Mode Développement (Optionnel)

Pour tester les modifications en temps réel:

1. Dans le terminal:
   ```bash
   npm run pbiviz:start
   ```

2. Dans Power BI Desktop:
   - Fichier > Options et paramètres > Options
   - Section **Aperçu**
   - Activer **Visuels de développeur**
   - Redémarrer Power BI Desktop

3. Utiliser le visuel de développeur (icône ⚡)
4. Les modifications du code se reflètent automatiquement

## Checklist de Validation

- [ ] Le visuel s'importe sans erreur
- [ ] Les données se chargent correctement
- [ ] Les 5 champs sont mappables
- [ ] Les barres s'affichent avec les bonnes proportions
- [ ] Les tooltips fonctionnent au survol
- [ ] L'effet de survol est visible
- [ ] La légende affiche toutes les catégories
- [ ] Les paramètres (hauteur, grille) fonctionnent
- [ ] Le redimensionnement fonctionne bien
- [ ] Les filtres Power BI s'appliquent correctement

## Prochaines Étapes

Une fois le test réussi:

1. **Utiliser avec vos données réelles**
2. **Personnaliser** (si nécessaire):
   - Modifier les couleurs dans `src/visual.ts`
   - Ajuster les styles dans `style/visual.less`
   - Repackager avec `npm run pbiviz:package`

3. **Partager**:
   - Distribuer le fichier `.pbiviz` à votre équipe
   - Publier sur AppSource (optionnel, pour distribution publique)

## Support

En cas de problème:

1. Consulter le fichier `README.md`
2. Vérifier les logs de console dans Power BI (F12)
3. Tester en mode développement pour voir les erreurs détaillées

---

**Bon test!** 🚀
