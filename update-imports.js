import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uiDir = join(__dirname, 'src/components/ui');
const files = readdirSync(uiDir);

files.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const filePath = join(uiDir, file);
    let content = readFileSync(filePath, 'utf8');
    
    // Update import paths
    content = content.replace(/from ['"]\.\.\/\.\.\/lib\/utils['"]/, `from '@lib/utils'`);
    content = content.replace(/from ['"]\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/, `from '@components/ui/$1'`);
    
    writeFileSync(filePath, content);
  }
});
