'use strict';
const options = require('../generators/options');
const chai = require('chai');

describe('options', () => {
  test('gets all', () => {
    chai
      .expect(options.getAll())
      .to.be.an('array')
      .and.include.deep.members([['style', options.style]]);
  });

  test('throws', () => {
    const dummyConfig = jest.fn();

    chai.assert.throws(
      () => options.include('something'),
      'options.include must be passed the config method of the Generator',
      'Not passing a function as the first parameter to options.include should throw'
    );
    chai.assert.throws(
      () => options.include(dummyConfig, {}),
      'options.include must be passed an option name or an array of option names as its seconds parameter',
      'Passing an object as the parameter to include must throw'
    );
  });

  test('includes array', () => {
    const dummyConfig = jest.fn();
    const dummyLog = jest.fn();

    options.include(dummyConfig, ['style', 'path', 'unexistent'], dummyLog);

    chai.expect(dummyLog.mock.calls.length).to.equal(1);
    chai.expect(dummyLog.mock.calls[0][0]).to.include('unexistent');
    chai
      .expect(dummyConfig.mock.calls)
      .to.include.deep.members([
        ['style', options.style],
        ['path', options.path]
      ]);
  });

  test('includes string', () => {
    const dummyConfig = jest.fn();

    options.include(dummyConfig, 'style');

    chai
      .expect(dummyConfig.mock.calls)
      .to.include.deep.members([['style', options.style]]);
  });
});
