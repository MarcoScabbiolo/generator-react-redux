'use strict';
const prompts = require('../generators/prompts');
const chai = require('chai');

describe('prompts', () => {
  test('gets and binds the props', () => {
    let single = prompts.get({}, 'style');
    let multiple = prompts.get(
      {
        style: 'Bootstrap',
        path: ''
      },
      ['bootstrap', 'path']
    );

    chai.expect(single.when).to.equal(true);
    chai.expect(multiple.map(p => p.when).every(x => !x)).to.equal(true);
    chai.assert.isEmpty(prompts.get({}, []));
    chai.assert.isUndefined(prompts.get({}, ''));
    chai.assert.throws(() => prompts.get());
  });
});
