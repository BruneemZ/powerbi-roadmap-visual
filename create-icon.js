const fs = require('fs');
const path = require('path');

// Créer une icône PNG 20x20 simple pour Power BI
// Icône avec fond blanc et design simple de roadmap (triangles colorés)
// PNG 20x20 avec fond blanc opaque
const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADsSURBVDhP7ZSxDYQwDEVNxQAswAiMkDYSO7ACIzACbMQGjMAIFEjUdBQ+yRGHkxMpKfgSUvT82Y4dO47jHIOZTWY2mdnEzM5mdmVmdzN7mtnLzIqiKH6Pc84rIrKXUs6pqTkR2UdRdOn+zyAivZRyiHPO67p+x3nvtJTyhpmNWmsFEVkopTZKqY1SalVK3UdRdPn8OiGlnJRSWynlEudcXdf1O857R0Q6KeWklNpGUXTp/s8QQgxaa4WI9FrrRQgx/OQ6IYRYtNYKEdkHIcafXCeEGIQQo9Z6QUTW4Vzn/z+O85/wzD4An6ZLp4DsJbQAAAAASUVORK5CYII=';

const iconBuffer = Buffer.from(iconBase64, 'base64');
const iconPath = path.join(__dirname, 'assets', 'icon.png');

fs.writeFileSync(iconPath, iconBuffer);
console.log('Icône créée avec succès:', iconPath);
console.log('Taille:', iconBuffer.length, 'bytes');
