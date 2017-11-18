'use strict';
const entry = require('./entry/test.js');
const assert = require('chai').assert;

entry(undefined, true);

describe('when the entry already exists', () => {
  test('throws', () => {
    assert.throws(() => entry(undefined, false));
  });
});
