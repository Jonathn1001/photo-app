import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildOpenApiDocument } from './registry.js';

export function writeOpenApiJson(outPath: string, title: string, version: string) {
  const doc = buildOpenApiDocument({ title, version });
  writeFileSync(resolve(outPath), JSON.stringify(doc, null, 2));
  console.log(`wrote ${outPath}`);
}
