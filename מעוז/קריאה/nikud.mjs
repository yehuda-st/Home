#!/usr/bin/env node
// Vocalize Hebrew prose in a Markdown document with Dicta Nakdan.
// Usage: node Reading/nikud.mjs [input.md] [output.md]
import { readFile, writeFile } from 'node:fs/promises';
import { nakdan } from 'dicta-nakdan';

const input = process.argv[2] || 'מעוז/קריאה/חידון חנוכה לילדים - שאלות 1-20.md';
const output = process.argv[3] || 'מעוז/קריאה/חידון חנוכה לילדים - שאלות 1-20 - מנוקד.md';
const source = await readFile(input, 'utf8');
const lines = source.split('\n');
const pointed = [];
let changed = 0;

for (const line of lines) {
  // Preserve empty lines and metadata; vocalize Markdown headings too.
  if (!line.trim() || /^https?:\/\//.test(line) || /^\|[\s|:\-]+\|$/.test(line)) {
    pointed.push(line);
    continue;
  }
  // Each paragraph is independently vocalized; no paragraph boundaries change.
  if (!/[\u0590-\u05ff]/u.test(line)) {
    pointed.push(line);
    continue;
  }
  const heading = line.match(/^(#{1,6}\s+)(.*)$/);
  const prefix = heading ? heading[1] : '';
  const textToVocalize = heading ? heading[2] : line;
  const result = await nakdan(textToVocalize, { genre: 'modern', timeoutMs: 120000 });
  if (!result.text || !/[\u0591-\u05c7]/u.test(result.text)) {
    throw new Error('No niqqud returned for paragraph: ' + line.slice(0, 60));
  }
  // Remove morphological boundaries inside Hebrew words.
  const cleaned = result.text.replace(/(?<=[\u0590-\u05ff])\|(?=[\u0590-\u05ff])/gu, '');
  pointed.push(prefix + cleaned);
  changed++;
  console.log('Vocalized paragraph', changed);
}
if (changed === 0) throw new Error('No paragraphs processed');
const final = pointed.join('\n');
if (final.split('\n').length !== lines.length) throw new Error('Paragraph structure changed');
await writeFile(output, final, 'utf8');
console.log('Wrote ' + output + ' (' + changed + ' paragraphs).');
