import assert from 'node:assert';
import { test } from 'node:test';
import { simplifyPath } from './simplifyPath.js';

test('simplify path', () => {
  const p = [
    { x: 0, y: 0 }, //*
    { x: 10, y: 0 },
    { x: 20, y: 0 },
    { x: 30, y: 0 },  //*
    { x: 30, y: 10 }, //*
    { x: 20, y: 10 },
    { x: 10, y: 10 }, // *
    { x: 10, y: 0 }, // *
    { x: 20, y: 0 } // *


  ]

  const newPath = simplifyPath(p);
  assert.strictEqual(newPath.length, 6);

  assert.strictEqual(newPath[1].x, 30);
  assert.strictEqual(newPath[1].y, 0);

  assert.strictEqual(newPath[2].x, 30);
  assert.strictEqual(newPath[2].y, 10);

  assert.strictEqual(newPath[4].x, 10);
  assert.strictEqual(newPath[4].y, 0);


});
