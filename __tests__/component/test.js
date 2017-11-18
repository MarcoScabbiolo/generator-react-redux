'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const reactReduxEnvironment = require('../../generators/ReactReduxEnvironment');
const environment = require('../../generators/component/Environment');
const testUtils = require('../_utils/testUtils');
const chai = require('chai');

const [envIndex, envFoo] = testUtils.testEnvironment(environment, { type: 'section' });

function testSuite(
  options = {
    runGenerator: true,
    prompts: {
      type: 'standard',
      name: 'test',
      path: 'generator_tests',
      container: true,
      style: 'Bootstrap'
    },
    options: {}
  },
  testEnvironment = false
) {
  var generator = new (environment(reactReduxEnvironment()))();
  generator.forceConfiguration(options.options, options.prompts);

  describe('generator-react-app-redux:component', () => {
    if (testEnvironment) {
      describe('environment', () => {
        test('returns', () => {
          chai.assert.exists(new (environment())());
        });

        test('component to create path', () => {
          chai.expect(envIndex()._componentToCreatePath).to.equal('components/index');
          chai
            .expect(envIndex()._componentToCreateFilePath)
            .to.equal('src/components/index.js');
          chai.expect(envFoo()._componentToCreatePath).to.equal('components/foo/bar');
          chai
            .expect(envFoo()._componentToCreateFilePath)
            .to.equal('src/components/foo/bar.js');
        });
      });
    }
    if (options.runGenerator) {
      test('generator completes', () =>
        helpers
          .run(path.join(__dirname, '../../generators/component'))
          .withOptions(options.options)
          .withPrompts(options.prompts));
    }

    test('creates files', () => {
      assert.file([generator._componentToCreateFilePath]);
    });

    testUtils.testFileContentsByProp({
      testTrue: 'imports react-bootstrap',
      testFalse: 'does not import react-bootrap',
      prop: generator.props.style,
      file: generator._componentToCreateFilePath,
      content: "import * as B from 'react-bootstrap';"
    });
  });
}

module.exports = testSuite;
