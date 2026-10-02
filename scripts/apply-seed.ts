/**
 * Applies the generated seed batches in supabase/seed-batches/ to a Supabase
 * project using the Management API.
 *
 * Reads SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF from the environment.
 * Safe to re-run: every statement is an upsert.
 *
 * USAGE:  npx tsx scripts/apply-seed.ts
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'supabase', 'seed-batches');
const REF = process.env.SUPABASE_PROJECT_REF;
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!REF || !TOKEN) {
  console.error('Set SUPABASE_PROJECT_REF and SUPABASE_ACCESS_TOKEN first.');
  process.exit(1);
}

async function main() {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = readFileSync(join(DIR, file), 'utf8');
    const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`${file} => FAILED ${res.status}: ${text.slice(0, 400)}`);
      process.exit(1);
    }
    console.log(`${file} => OK (${sql.length} bytes)`);
  }
}

main().catch((err) => {
  console.error('apply-seed failed:', err);
  process.exit(1);
});
