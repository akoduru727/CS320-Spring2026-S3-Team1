import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const name = process.argv[2];
const accTypeArg = process.argv[3];
if (!name) {
  console.error('read README for command format');
  process.exit(1);
}

const resolveAccTypeFromName = (base) => {
  const lower = base.toLowerCase();
  if (lower.includes('landlord')) return 'landlord';
  if (lower.includes('tenant')) return 'tenant';
  if (lower.includes('bypass')) return 'tenant';
  return '';
};

const runOne = (file, accTypeOverride) => {
  const accType = accTypeOverride ?? '';
  const env = {
    ...process.env,
    auth: accType ? 'true' : 'false',
    acc_type: accType || undefined
  };

  const result = spawnSync('npx', ['playwright', 'test', `tests/${file}`], {
    stdio: 'inherit',
    env
  });

  return result.status ?? 1;
};

if (name === 'all') {
  const testsDir = join(process.cwd(), 'tests');
  const files = readdirSync(testsDir)
    .filter((f) => f.endsWith('.e2e.ts'))
    .sort();

  if (files.length === 0) {
    console.error('No .e2e.ts files found in tests/.');
    process.exit(1);
  }

  for (const file of files) {
    const base = file.replace(/\.e2e\.ts$/, '');
    const accType = resolveAccTypeFromName(base);

    const status = runOne(file, accType);
    if (status !== 0) process.exit(status);
  }

  process.exit(0);
}

const file = `${name}.e2e.ts`;
const accType = accTypeArg && accTypeArg.length > 0 ? accTypeArg : resolveAccTypeFromName(name);
process.exit(runOne(file, accType));
