#!/usr/bin/env node
// Генерирует src/lib/assets.generated.ts — явную таблицу require(...) для Metro.
// Персонаж: assets/characters/{stage}_{emotion}.png
// Утка:     assets/duck/duck_ember.png, duck_{stage}_{emotion}.png
// Запуск: node scripts/gen-assets.js (после добавления новых картинок).
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'src', 'lib', 'assets.generated.ts');
const ST = '(ember|spark|glow|blaze|nova)';
const EM = '(happy|sad|sleepy|energetic)';
const reChar = new RegExp(`^${ST}_${EM}\\.png$`);
const reDuck = new RegExp(`^duck_(ember|${ST}_${EM})\\.png$`);

function table(dir, re, rel) {
  const full = path.join(root, dir);
  const files = fs.existsSync(full)
    ? fs.readdirSync(full).filter(f => re.test(f)).sort()
    : [];
  return {
    count: files.length,
    body: files
      .map(f => `  ${f.replace('.png', '')}: require('${rel}/${f}'),`)
      .join('\n'),
  };
}

const ch = table('assets/characters', reChar, '../../assets/characters');
const dk = table('assets/duck', reDuck, '../../assets/duck');
if (ch.count === 0) {
  console.error('Нет ни одной картинки персонажа в assets/characters');
  process.exit(1);
}
fs.writeFileSync(
  out,
  `// Автогенерация: node scripts/gen-assets.js. Не править вручную.\n` +
    `import type { ImageSourcePropType } from 'react-native';\n\n` +
    `type Table = Record<string, ImageSourcePropType | undefined>;\n\n` +
    `export const CHARACTER_IMAGES: Table = {\n${ch.body}\n};\n\n` +
    `export const DUCK_IMAGES: Table = {\n${dk.body}${dk.body ? '\n' : ''}};\n`,
);
console.log(`assets.generated.ts: персонаж ${ch.count}, утка ${dk.count}`);
