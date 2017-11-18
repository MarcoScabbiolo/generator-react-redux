'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const testUtils = require('../_utils/testUtils');
const _ = require('lodash');
const reactReduxEnvironment = require('../../generators/ReactReduxEnvironment');
const environment = require('../../generators/reducer/Environment');
const chai = require('chai');
require('chai').should();

const [envIndex, envFoo] = testUtils.testEnvironment(environment, { type: 'section' });

function testSuite(
  options = {
    runGenerator: true,
    prompts: {
      type: 'simple',
      name: 'test',
      path: 'generator_tests'
    },
    options: {
      actions: {
        app: 'actions/app',
        other: 'actions/other'
      }
    }
  },
  testEnvironment = false
) {
  var generator = new (environment(reactReduxEnvironment()))();
  generator.forceConfiguration(options.options, options.prompts);

  describe('generator-react-app-redux:reducer', () => {
    if (testEnvironment) {
      describe('environment', () => {
        test('returns', () => {
          chai.assert.exists(new (environment())());
        });

        test('reducer to create path', () => {
          envIndex()._reducerToCreatePath.should.equal('reducers/index/sections/index');
          envIndex()._reducerToCreateFilePath.should.equal(
            'src/reducers/index/sections/index.js'
          );
          envFoo()._reducerToCreatePath.should.equal('reducers/foo/bar');
          envFoo()._reducerToCreateFilePath.should.equal('src/reducers/foo/bar.js');
        });
      });
    }
    if (options.runGenerator) {
      test('generator completes', () =>
        helpers
          .run(path.join(__dirname, '../../generators/reducer'))
          .withOptions(options.options)
          .withPrompts(options.prompts));
    }

    test('creates files', () => {
      assert.file([generator._reducerToCreateFilePath]);
    });

    if (generator.props.type === 'composition') {
      test('imports all the reducers', () => {
        _.forIn(generator.props.reducers, (filePath, name) =>
          assert.fileContent(
            generator._reducerToCreateFilePath,
            `import ${name} from '${filePath}';`
          )
        );
      });

      test('combines all the reducers', () => {
        assert.fileContent(
          generator._reducerToCreateFilePath,
          'const reducer = combineReducers({\n  ' +
            _.keys(generator.props.reducers).join(',\n  ') +
            '\n});'
        );
      });
    } else {
      test(
        'imports all the actions',
        testUtils.importsAllActions(
          generator.props.actions,
          generator._reducerToCreateFilePath
        )
      );
    }
  });
}

module.exports = testSuite;
