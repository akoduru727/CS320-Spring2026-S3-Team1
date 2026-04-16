#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const script = path.join(__dirname, 'run-e2e.mjs');
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [script, ...args], {
  stdio: 'inherit',
  env: process.env
});



process.exit(result.status ?? 1);
