const fs = require('fs');
const path = require('path');

// Créer une icône PNG 20x20 simple pour Power BI
// Fond bleu clair avec triangles colorés représentant des milestones
// PNG 20x20 opaque (pas de transparence)
const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAAIRJREFUOE/tkjEKACAIRfv+h3YJ2qLBIZpEcPDDT/xRxMyqmVU5Z865aGaD8/7gnPfmnI/W2uScT0TkFhFxRMQSkbO19ieE8AshfEII34UQvgshfOec+845973W+qy1Pmut7VJKKaWUY0ppp5RSSikbpdRaSllrrSul1LqUsnqt9UdrfXmt9a+1frTWBzO7AMenS6cVWgoGAAAAAElFTkSuQmCC';

const iconBuffer = Buffer.from(iconBase64, 'base64');
const iconPath = path.join(__dirname, 'assets', 'icon.png');

fs.writeFileSync(iconPath, iconBuffer);
console.log('Icône créée avec succès:', iconPath);
console.log('Taille:', iconBuffer.length, 'bytes');
