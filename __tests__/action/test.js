'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const reactReduxEnvironment = require('../../generators/ReactReduxEnvironment');

function testSuite(
  options = {
    runGenerator: true,
    prompts: {
      name: 'test',
      path: 'generator_tests'
    },
    options: {}
  }
) {
  var generator = new (reactReduxEnvironment())();
  generator.forceConfiguration(options.options, options.prompts);

  describe('generator-react-app-redux:action', () => {
    if (options.runGenerator) {
      test('generator completes', () =>
        helpers
          .run(path.join(__dirname, '../../generators/action'))
          .withOptions(options.options)
          .withPrompts(options.prompts));
    }

    test('creates files', () => {
      assert.file([generator._actionsFilePath]);
    });

    test('sets the prfeix', () => {
      assert.fileContent(
        generator._actionsFilePath,
        `const actionPrefix = '${generator._resolvedPath}';`
      );
    });
  });
}

module.exports = testSuite;
