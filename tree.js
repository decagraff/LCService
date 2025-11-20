// show-structure.js
const fs = require('fs');
const path = require('path');

const ignoredItems = [
    'node_modules',
    '.git',
    '.env',
    '.gitignore',
    'package-lock.json',
    '.DS_Store',
    'Thumbs.db',
    '*.log',
    'uploads'
];

function shouldIgnore(itemName) {
    return ignoredItems.some(ignored => {
        if (ignored.includes('*')) {
            return itemName.includes(ignored.replace('*', ''));
        }
        return itemName === ignored;
    });
}

function showStructure(dirPath, prefix = '', isRoot = true) {
    if (isRoot) {
        console.log(path.basename(dirPath) + '/');
    }
    
    try {
        const items = fs.readdirSync(dirPath)
            .filter(item => !shouldIgnore(item))
            .sort((a, b) => {
                const aIsDir = fs.statSync(path.join(dirPath, a)).isDirectory();
                const bIsDir = fs.statSync(path.join(dirPath, b)).isDirectory();
                if (aIsDir && !bIsDir) return -1;
                if (!aIsDir && bIsDir) return 1;
                return a.localeCompare(b);
            });

        items.forEach((item, index) => {
            const itemPath = path.join(dirPath, item);
            const isLast = index === items.length - 1;
            const currentPrefix = isLast ? '└── ' : '├── ';
            const nextPrefix = isLast ? '    ' : '│   ';
            
            console.log(prefix + currentPrefix + item + (fs.statSync(itemPath).isDirectory() ? '/' : ''));
            
            if (fs.statSync(itemPath).isDirectory()) {
                showStructure(itemPath, prefix + nextPrefix, false);
            }
        });
    } catch (error) {
        console.error('Error reading directory:', error.message);
    }
}

// Ejecutar desde el directorio actual
showStructure(process.cwd());