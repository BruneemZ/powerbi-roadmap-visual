# Démarrage Rapide - Visuel Roadmap Power BI

## Étapes pour utiliser votre visuel

### 1. Installation de Power BI Visual Tools (une seule fois)

Ouvrez un terminal et exécutez :

```bash
sudo npm install -g powerbi-visuals-tools
```

Créez ensuite le certificat SSL pour le développement :

```bash
pbiviz --install-cert
```

### 2. Créer l'icône du visuel

1. Naviguez vers le dossier `assets/`
2. Suivez les instructions dans `ICON_INSTRUCTIONS.txt` pour créer `icon.png`
   - Le plus simple : utilisez un convertisseur en ligne comme cloudconvert.com
   - Convertissez `icon.svg` en PNG 20x20 pixels

### 3. Tester le visuel en mode développement

Dans le terminal, depuis le dossier du projet :

```bash
pbiviz start
```

Cela démarre un serveur local. Ensuite :

1. Ouvrez **Power BI Desktop**
2. Allez dans **Fichier > Options et paramètres > Options**
3. Dans **Aperçu**, activez **Visuels de développeur**
4. Redémarrez Power BI Desktop
5. Vous verrez une icône de visuel de développeur (⚡) dans le volet Visualisations

### 4. Charger les données d'exemple

1. Dans Power BI Desktop, cliquez sur **Obtenir des données > Texte/CSV**
2. Sélectionnez le fichier `exemple-donnees.csv` fourni
3. Cliquez sur **Charger**

### 5. Utiliser le visuel

1. Cliquez sur l'icône du visuel de développeur (⚡) dans le volet Visualisations
2. Faites glisser les champs vers les zones appropriées :
   - **Tâche** → Zone "Tâche"
   - **Date de début** → Zone "Date de début"
   - **Date de fin** → Zone "Date de fin"
   - **Catégorie** → Zone "Catégorie"
   - **Progression** → Zone "Progression (%)"

3. Le visuel affiche maintenant votre roadmap !

### 6. Personnaliser le visuel

Cliquez sur le pinceau (Format) dans le volet Visualisations pour :
- Ajuster la hauteur des barres
- Activer/désactiver la grille

### 7. Packager le visuel pour distribution

Quand vous êtes satisfait du résultat :

```bash
pbiviz package
```

Le fichier `.pbiviz` sera créé dans le dossier `dist/`.

### 8. Importer le visuel dans Power BI

1. Dans Power BI Desktop, cliquez sur **...** dans le volet Visualisations
2. Sélectionnez **Importer un visuel à partir d'un fichier**
3. Choisissez le fichier `.pbiviz` du dossier `dist/`
4. Le visuel est maintenant disponible dans tous vos rapports !

## Résolution de problèmes

### Le visuel ne s'affiche pas
- Vérifiez que `pbiviz start` est bien en cours d'exécution
- Vérifiez que les visuels de développeur sont activés dans les options

### Erreur de compilation
- Exécutez `npm install` pour réinstaller les dépendances
- Exécutez `npm run build` pour vérifier les erreurs TypeScript

### Problème de certificat SSL
- Réexécutez `pbiviz --install-cert`
- Redémarrez Power BI Desktop

## Personnalisation avancée

Pour modifier le code :

1. Éditez les fichiers dans `src/`
   - `visual.ts` : Logique principale du visuel
   - `settings.ts` : Paramètres configurables

2. Modifiez les styles dans `style/visual.less`

3. Ajustez les capacités dans `capabilities.json`

4. Le visuel se recharge automatiquement si `pbiviz start` est actif

## Support

Consultez le fichier `README.md` pour plus de détails sur l'architecture et la personnalisation.
