'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const testUtils = require('../_utils/testUtils');
const environment = require('../../generators/ReactReduxEnvironment');

function testSuite(
  options = {
    skip: false,
    runGenerator: true,
    prompts: {
      form: true,
      thunk: true,
      normalizr: true,
      name: 'test',
      path: 'generator_tests'
    },
    options: {}
  }
) {
  var generator = new (environment())();
  generator.forceConfiguration(options.options, options.prompts);

  (options.skip ? describe.skip : describe)('generator-react-app-redux:store', () => {
    if (options.runGenerator) {
      test('generator completes', () =>
        helpers
          .run(path.join(__dirname, '../../generators/store'))
          .withOptions(options.options)
          .withPrompts(options.prompts));
    }

    test('creates files', () => {
      assert.file([
        generator._rootReducerFilePath,
        generator._storeFilePath,
        generator._sectionsReducerFilePath,
        generator._entitiesReducerFilePath
      ]);
    });

    describe('file contents', () => {
      testUtils.testFileContentsByProp({
        testTrue: 'imports redux-form',
        testFalse: 'does not import redux-form',
        prop: generator.props.form,
        file: generator._rootReducerFilePath,
        content: "import { reducer as form } from 'redux-form';"
      });

      test('imports reducer in store', () => {
        assert.fileContent(
          generator._storeFilePath,
          `import mainReducer from '${generator._rootReducerPath}'`
        );
      });

      test('creates root reducer', () => {
        assert.fileContent(
          generator._rootReducerFilePath,
          `import entities from '${generator._entitiesReducerPath}';`
        );
        assert.fileContent(
          generator._rootReducerFilePath,
          `import sections from '${generator._sectionsReducerPath}';`
        );
      });

      testUtils.testFileContentsByProp({
        testTrue: 'imports redux-thunk',
        testFalse: 'does not import redux-thunk',
        prop: generator.props.thunk,
        file: generator._storeFilePath,
        content: "import thunk from 'redux-thunk';"
      });

      testUtils.testFileContentsByProp({
        testTrue: 'imports normalizr',
        testFalse: 'does not import normalizr',
        prop: generator.props.normalizr,
        file: generator._entitiesReducerFilePath,
        content: "import { normalize, schema } from 'normalizr';"
      });
    });
  });
}

module.exports = testSuite;
