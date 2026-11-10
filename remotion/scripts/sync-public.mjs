// Copies what Remotion needs from the repo into remotion/public/ (git-ignored).
//   node scripts/sync-public.mjs [episode ...]   (default: every episode)
// Remotion only serves files from public/, and copying keeps renders reproducible.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');
const pub = join(here, '..', 'public');

const all = readdirSync(join(repo, 'episodes'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
const episodes = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const list = episodes.length ? episodes : all;

mkdirSync(pub, { recursive: true });

for (const ep of list) {
  const src = join(repo, 'episodes', ep);
  if (!existsSync(src)) {
    console.error(`✗ no episode ${ep}`);
    process.exit(1);
  }
  const dst = join(pub, 'episodes', ep);
  rmSync(dst, { recursive: true, force: true });
  mkdirSync(dst, { recursive: true });
  cpSync(join(src, 'scenes.json'), join(dst, 'scenes.json'));
  const files = [];
  for (const dir of ['vo', 'frames', 'clips']) {
    if (!existsSync(join(src, dir))) continue;
    cpSync(join(src, dir), join(dst, dir), { recursive: true });
    for (const f of readdirSync(join(src, dir), { recursive: true })) files.push(`${dir}/${f}`);
  }
  // What exists, so the composition never has to probe for missing files.
  writeFileSync(join(dst, 'manifest.json'), JSON.stringify(files.sort(), null, 2));
  console.log(`✓ synced episodes/${ep} (${files.length} files)`);
}

const mouths = join(repo, 'character', 'mouth-shapes');
const mouthsDst = join(pub, 'character', 'mouth-shapes');
rmSync(mouthsDst, { recursive: true, force: true });
if (existsSync(mouths)) {
  cpSync(mouths, mouthsDst, { recursive: true });
  console.log('✓ synced character/mouth-shapes');
}

// Background plates (flat painted sets), shared by every episode.
const sets = join(repo, 'sets');
const setsDst = join(pub, 'sets');
rmSync(setsDst, { recursive: true, force: true });
const setNames = [];
if (existsSync(sets)) {
  cpSync(sets, setsDst, { recursive: true });
  for (const f of readdirSync(sets)) if (f.endsWith('.png')) setNames.push(f.replace(/\.png$/, ''));
  console.log(`✓ synced sets (${setNames.length})`);
}
writeFileSync(join(pub, 'sets.json'), JSON.stringify(setNames));

// Index so the composition can list episodes without a server.
writeFileSync(join(pub, 'episodes.json'), JSON.stringify(all, null, 2));
