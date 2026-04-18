const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// remove vite from dependencies
if (pkg.dependencies && pkg.dependencies.vite) {
  delete pkg.dependencies.vite;
}
if (pkg.dependencies && pkg.dependencies['@types/d3-scale']) {
   delete pkg.dependencies['@types/d3-scale'];
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
