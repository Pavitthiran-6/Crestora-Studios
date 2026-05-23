const fs = require('fs');
const path = require('path');

const dir = 'd:/Projects/Own and Client Projects/Startup/src';

const exclusions = [
  'WorkDetailsPage.tsx',
  'admin'
];

function walkDir(currentPath) {
  const files = fs.readdirSync(currentPath);
  for (const file of files) {
    const fullPath = path.join(currentPath, file);
    const stat = fs.statSync(fullPath);
    
    // Check exclusions
    // Normalize path to use forward slashes for the exclusion check
    const normalizedPath = fullPath.replace(/\\/g, '/');
    if (exclusions.some(ex => normalizedPath.includes(ex))) {
      continue;
    }

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content
        .replace(/#1f2547/gi, '#2F4156')
        .replace(/#ef4444/gi, '#567C8D')
        .replace(/#1a1e3b/gi, '#232b5c');
        
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkDir(dir);
console.log("Done");
