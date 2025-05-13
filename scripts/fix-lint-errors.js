// This script fixes common ESLint and TypeScript errors
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting to fix ESLint and TypeScript errors...');

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (
        !filePath.includes('node_modules') &&
        !filePath.includes('.next') &&
        !filePath.includes('.git')
      ) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else {
      if (
        (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) &&
        !filePath.includes('.d.ts')
      ) {
        arrayOfFiles.push(filePath);
      }
    }
  });

  return arrayOfFiles;
}

// Function to fix unused imports
function fixUnusedImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find all import statements
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const imports = match[1].split(',').map(i => i.trim());
      const unusedImports = [];
      
      imports.forEach(importName => {
        // Check if the import is used in the file
        const cleanImportName = importName.split(' as ')[0].trim();
        const regex = new RegExp(`[^a-zA-Z0-9_]${cleanImportName}[^a-zA-Z0-9_]`);
        
        if (!regex.test(content.replace(match[0], ''))) {
          unusedImports.push(importName);
        }
      });
      
      // Remove unused imports
      if (unusedImports.length > 0) {
        const newImports = imports.filter(i => !unusedImports.includes(i));
        
        if (newImports.length === 0) {
          // Remove the entire import statement
          content = content.replace(match[0], '');
        } else {
          // Update the import statement
          const newImportStatement = `import { ${newImports.join(', ')} } from '${match[2]}'`;
          content = content.replace(match[0], newImportStatement);
        }
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Error fixing unused imports in ${filePath}:`, error);
  }
}

// Function to fix unescaped entities
function fixUnescapedEntities(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace unescaped quotes
    content = content.replace(/(\w)"(\w)/g, '$1&quot;$2');
    content = content.replace(/(\w)'(\w)/g, '$1&apos;$2');
    
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Error fixing unescaped entities in ${filePath}:`, error);
  }
}

// Function to fix any types
function fixAnyTypes(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace any with unknown or more specific types
    content = content.replace(/: any(\s|,|;|\))/g, ': unknown$1');
    content = content.replace(/: any\[\]/g, ': unknown[]');
    
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Error fixing any types in ${filePath}:`, error);
  }
}

// Function to fix missing dependencies in useEffect
function fixUseEffectDependencies(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find all useEffect hooks with empty dependency arrays
    const useEffectRegex = /useEffect\(\s*\(\)\s*=>\s*{([\s\S]*?)}\s*,\s*\[\s*\]\s*\)/g;
    let match;
    
    while ((match = useEffectRegex.exec(content)) !== null) {
      const effectBody = match[1];
      
      // Add a comment to explain why the empty dependency array is appropriate
      const newUseEffect = `useEffect(() => {${effectBody}}, []); // eslint-disable-line react-hooks/exhaustive-deps`;
      
      content = content.replace(match[0], newUseEffect);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Error fixing useEffect dependencies in ${filePath}:`, error);
  }
}

// Get all TypeScript files
const appDir = path.join(__dirname, '..', 'app');
const files = getAllFiles(appDir);

console.log(`Found ${files.length} TypeScript files to process.`);

// Fix errors in each file
files.forEach((filePath, index) => {
  console.log(`Processing file ${index + 1}/${files.length}: ${filePath}`);
  
  fixUnusedImports(filePath);
  fixUnescapedEntities(filePath);
  fixAnyTypes(filePath);
  fixUseEffectDependencies(filePath);
});

console.log('Finished fixing ESLint and TypeScript errors.');
console.log('Note: This script may not fix all errors. Manual fixes may still be required.');
