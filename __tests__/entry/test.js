('use strict');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const astUtils = require('../../generators/astUtils');
const testUtils = require('../_utils/testUtils');
const fs = require('fs-extra');
const action = require('../action/test');
const store = require('../store/test');
const reducer = require('../reducer/test');
const component = require('../component/test');
const reactReduxEnvironment = require('../../generators/ReactReduxEnvironment');
const environment = require('../../generators/entry/Environment');
const chai = require('chai');

const [envMain, envFoo] = testUtils.testEnvironment(environment);
const entryInAstArray = (e, generator) =>
  e.type === 'ObjectProperty' &&
  e.key.name === generator.props.name &&
  e.value.value === generator._jsEntryFilePath;
const assertAddedEntry = generator =>
  chai
    .expect(astUtils.parse(fs.readFileSync('webpack/entries.js', 'utf-8')))
    .to.have.nested.property('program.body[0].expression.right.properties')
    .that.is.an('array')
    .and.satisfies(entries => entries.some(e => entryInAstArray(e, generator)));

function testSuite(
  options = {
    skip: false,
    runGenerator: true,
    prompts: {
      style: 'Bootstrap',
      thunk: true,
      form: true,
      normalizr: true
    },
    options: {
      skipEntryDirectory: false,
      path: 'generator_tests',
      name: 'test'
    }
  },
  testEnvironment = false
) {
  var generator = new (environment(reactReduxEnvironment()))();
  generator.forceConfiguration(options.options, options.prompts);

  (options.skip ? describe.skip : describe)('generator-react-app-redux:entry', () => {
    if (testEnvironment) {
      describe('environment', () => {
        test('returns', () => {
          chai.assert.exists(new (environment())());
        });

        test('html entry file path', () => {
          chai.expect(envMain()._htmlEntryFilePath).to.equal('src/main.ejs');
          chai.expect(envFoo()._htmlEntryFilePath).to.equal('src/foo/bar.ejs');
        });

        test('related actions', () => {
          chai.expect(envMain()._relatedActions).to.deep.equal({
            app: 'actions/app',
            main: 'actions/main'
          });
          chai.expect(envFoo()._relatedActions).to.deep.equal({
            app: 'actions/app',
            bar: 'actions/foo/bar'
          });
        });
      });
    }

    if (options.runGenerator) {
      test('generator completes', () =>
        helpers
          .run(path.join(__dirname, '../../generators/entry'))
          .withOptions(options.options)
          .withPrompts(options.prompts));
    }

    test('creates files', () => {
      assert.file([generator._jsEntryFilePath, generator._htmlEntryFilePath]);
    });

    describe('file contents', () => {
      test('imports container', () => {
        assert.fileContent(
          generator._jsEntryFilePath,
          `import Main from '${generator._defaultContainerPath}';`
        );
        assert.fileContent(
          generator._jsEntryFilePath,
          `const mainContainerPath = '${generator._defaultContainerPath}';`
        );
      });
      test('imports store', () => {
        assert.fileContent(
          generator._jsEntryFilePath,
          `import configureStore from '${generator._storePath}`
        );
      });
    });

    test('adds entry', () => {
      if (fs.existsSync('webpack/entries.js')) {
        assertAddedEntry(generator);
      }
    });

    action({
      runGenerator: false,
      options: {
        name: generator.props.name,
        path: generator.props.path
      }
    });

    store({
      runGenerator: false,
      options: {
        form: generator.props.form,
        thunk: generator.props.thunk,
        name: generator.props.name,
        path: generator.props.path,
        normalizr: generator.props.normalizr
      }
    });

    reducer({
      runGenerator: false,
      options: {
        name: generator.props.name,
        path: generator.props.path,
        type: 'section',
        actions: generator._relatedActions
      }
    });

    component({
      runGenerator: false,
      options: {
        style: generator.props.style,
        name: 'index',
        path: generator.props.name,
        type: 'section'
      }
    });
  });
}

module.exports = testSuite;
