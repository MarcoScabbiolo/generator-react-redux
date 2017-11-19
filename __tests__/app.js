'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fs = require('fs-extra');
const entry = require('./entry/test.js');
const expect = require('chai').expect;
const astUtils = require('../generators/astUtils');

const dummyDependencies = [[helpers.createDummyGenerator(), 'generator-node:app']];

const assertBabelrc = babelrc =>
  expect(babelrc)
    .to.have.property('plugins')
    .which.is.an('array')
    .and.includes('react-hot-loader/babel');

describe('generator-react-app-redux:app', () => {
  test('generator completes', () =>
    helpers
      .run(path.join(__dirname, '../generators/app'))
      .withOptions({ license: false })
      .withPrompts({
        style: 'Bootstrap',
        form: true,
        normalizr: true
      })
      .withGenerators(dummyDependencies));

  test('creates files', () => {
    assert.file([
      'src/actions/app.js',
      'src/components/App.js',
      'src/containers/App.js',
      'src/reducers/app.js',
      'webpack/base.js',
      'webpack/config.json',
      'webpack/dev.js',
      'webpack/dist.js',
      'webpack/entries.js',
      '.babelrc',
      '.gitignore',
      'webpack.config.js',
      'package.json',
      'dist'
    ]);
  });

  describe('file contents', () => {
    test('imports react-boostrap', () => {
      assert.fileContent(
        'src/components/App.js',
        "import * as B from 'react-bootstrap';"
      );
    });

    test('babelrc', () => fs.readJson('.babelrc').then(assertBabelrc));
  });

  test('dependencies', () =>
    fs.readJson('package.json').then(pkg => {
      expect(pkg.dependencies).to.include.all.keys(
        'redux-thunk',
        'react-bootstrap',
        'redux-form',
        'normalizr'
      );
    }));

  entry({
    runGenerator: false,
    options: {
      style: 'Bootstrap',
      name: 'main',
      form: true,
      normalizr: true,
      thunk: true,
      path: '',
      skipEntryDirectory: true
    },
    prompts: {}
  });
});

describe('generator-react-app-redux:app:2', () => {
  test('keeps original .babelrc', () =>
    helpers
      .run(path.join(__dirname, '../generators/app'))
      .withOptions({ license: false })
      .withPrompts({
        style: 'Bootstrap',
        form: false,
        normalizr: false,
        thunk: false
      })
      .withGenerators(dummyDependencies)
      .inTmpDir(dir => {
        fs.writeFileSync(path.join(dir, '.babelrc'), '{ "dummy": "dummy" }');
      })
      .then(() => fs.readJson('.babelrc'))
      .then(babelrc => {
        assertBabelrc(babelrc);
        expect(babelrc).to.have.property('dummy', 'dummy');
      }));

  entry({
    runGenerator: false,
    options: {
      style: 'Bootstrap',
      name: 'main',
      form: false,
      normalizr: false,
      thunk: false,
      path: '',
      skipEntryDirectory: true
    },
    prompts: {}
  });
});

describe('ast utils completion', () => {
  assert.throws(() => astUtils.importAll({}, 'something'));
});
