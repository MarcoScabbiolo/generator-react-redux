'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const reactReduxEnvironment = require('../../generators/ReactReduxEnvironment');
const environment = require('../../generators/container/Environment');
const testUtils = require('../_utils/testUtils');
const chai = require('chai');
const fs = require('fs-extra');
const _ = require('lodash');

const GENERATOR_DIR = '../../generators/container';
const [envMain, envFoo] = testUtils.testEnvironment(environment);

function testSuite(
  options = {
    runGenerator: true,
    componentName: 'TestComponent',
    prompts: {
      name: 'test',
      path: 'generator_tests',
      component: 'test_component.js'
    },
    options: {
      actions: {
        app: 'actions/app',
        test: 'actions/test'
      }
    }
  },
  testEnvironment = false
) {
  options.componentName = _.upperFirst(options.componentName);
  var generator = new (environment(reactReduxEnvironment()))();
  generator.forceConfiguration(options.options, options.prompts);

  describe('generator-react-app-redux:container', () => {
    if (testEnvironment) {
      describe('environment', () => {
        test('returns', () => {
          chai.assert.exists(new (environment())());
        });

        test('container to create path', () => {
          chai.expect(envMain()._containerToCreatePath).to.equal('containers/main');
          chai
            .expect(envMain()._containerToCreateFilePath)
            .to.equal('src/containers/main.js');
          chai.expect(envFoo()._containerToCreatePath).to.equal('containers/foo/bar');
          chai
            .expect(envFoo()._containerToCreateFilePath)
            .to.equal('src/containers/foo/bar.js');
        });
      });
    }
    if (options.runGenerator) {
      test('generator completes', () =>
        helpers
          .run(path.join(__dirname, GENERATOR_DIR))
          .withOptions(options.options)
          .withPrompts(options.prompts)
          .inTmpDir(dir => {
            fs.writeFileSync(
              path.join(dir, generator.props.component),
              `export default ${options.componentName}`
            );
          }));
    }

    test('creates files', () => {
      assert.file([generator._containerToCreateFilePath]);
    });

    test('imports the component', () => {
      assert.fileContent(
        generator._containerToCreateFilePath,
        `import ${options.componentName} from '${generator._componentsPath()}';`
      );
    });

    test(
      'imports all the actions',
      testUtils.importsAllActions(
        generator.props.actions,
        generator._containerToCreateFilePath
      )
    );

    test('imports component name', () => {
      chai
        .expect(
          fs
            .readFileSync(generator._containerToCreateFilePath, { encoding: 'utf-8' })
            .split(options.componentName).length
        )
        .to.equal(
          3,
          `${fs.readFileSync(generator._containerToCreateFilePath, {
            encoding: 'utf-8'
          })} \n\nshould include ${options.componentName} 2 times`
        );
    });
  });

  if (options.runGenerator) {
    describe('generator throws with invalid input', () => {
      test('unexistent component', () =>
        helpers
          .run(path.join(__dirname, GENERATOR_DIR))
          .withOptions({ component: 'DOESNT_EXIST.js' })
          .then(() =>
            assert.fail('Unexistent component was passed and the generator completed')
          )
          .catch(err =>
            assert.ok(err, 'Excepected an error to be thrown be the generator')
          ));
    });
  }
}

module.exports = testSuite;
