const fs = require('fs');
const path = require('path');

// Créer une icône PNG 20x20 simple en base64
// Ceci est une petite icône bleue avec des barres blanches (roadmap stylisée)
const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE5SURBVDiNpdRNSgNBEAXgL4kBIYuIIIiLgAuPIHgBT+AFPIBncOfGhQsP4M6NB3DhUjyAR3AnuBBEEEQQ/IkmiYtqaBqnZyb4oJnuflVdXV1d/1QZYxQxxhiHOMU+DrCFdVzjBZ+YR4xRxhjDIo5wh26Ov/Zet9jAXB5gAie4y4ErXGEBA1nAGj7ygCuWKc80tnOA+xn8BBfoVy2cxX0OsI+zCuMZjrNQAw/RyeCnWE4DdnCcwfexlAa0tJfBT7FY13HjCt5JA44qjCd14CgN+FZhfE8DblW8v8ZmGnBY8f4eW2nA9Qr+EjtpwH6F8Rg7acD1imvcxl4acKPieIbdNGA/N3zjCT4wSEOs4jmD93CJ1azJFq4xmdesYjk7+zl6+XCbuMVFKjWUPlrYzs5+jl5NabVWxYP/4n/yC1DyXL13AgbUAAAAAElFTkSuQmCC';

const iconBuffer = Buffer.from(iconBase64, 'base64');
const iconPath = path.join(__dirname, 'assets', 'icon.png');

fs.writeFileSync(iconPath, iconBuffer);
console.log('Icône créée avec succès:', iconPath);
