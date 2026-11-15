import './round2.check.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

// Execute only the packaged JS registration; no React or DOM.
let registration;
const source=readFileSync(new URL('./client.js',import.meta.url),'utf8');
runInNewContext(source,{window:{__ModuleLoader__:{load(value){registration=value;}}}},{timeout:1000});
assert.equal(registration.id,'dsh-last-word');
console.log('Packaged client registration checks passed.');