'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const extend = require('deep-extend');
const _ = require('lodash');
const path = require('path');
const sharedOptions = require('../options');
const sharedPrompts = require('../prompts');
const esprima = require('esprima');
const escodegen = require('escodegen');
const astUtils = require('../astUtils');

const shared = ['thunk', 'path', 'form'];

module.exports = class extends Generator {
  constructor(args, options) {
    super(args, options);

    this.option('name', {
      type: String,
      required: false,
      desc: 'The name of the store'
    });

    sharedOptions.include(this.option.bind(this), shared, this.log.bind(this));

    this.props = {};

    if (_.isString(args)) {
      this.props.name = args;
    } else if (_.isArray(args) && args.length) {
      this.props.name = args[0];
      this.props.path = args[1];
    }
  }
  _resolvedPath() {
    return path.join(this.props.path, this.props.name);
  }
  initializing() {
    this.props = Object.assign({}, this.options, this.props);
  }
  prompting() {
    this.log('');
    this.log(chalk.green('Store') + ' generator');
    this.log('');

    return this.prompt(
      [
        {
          name: 'name',
          message: 'What will be the name of the new store?',
          when: !this.props.name
        }
      ].concat(sharedPrompts.get(this.props, shared))
    ).then(props => {
      this.props = extend(this.props, props);
    });
  }
  _writeRootReducer() {
    let ast = esprima.parseModule(this.fs.read(this.templatePath('rootReducer.js')));

    // Find the object containing the reducers to be combined
    let toCombine = astUtils.findSingleVariableDeclaration(ast, 'const', 'reducer')
      .declarations[0].init.arguments[0].properties;

    // Import redux-form if included
    if (this.props.form) {
      ast = astUtils.newImport(
        ast,
        astUtils.importDeclaration('redux-form', [
          astUtils.importSpecifier('form', 'reducer')
        ])
      );

      toCombine.push(astUtils.shorthandProperty('form'));
    }

    // Write the root reducer file
    this.fs.write(
      this.destinationPath(`reducer/${this._resolvedPath()}.js`),
      escodegen.generate(ast)
    );
  }
  _writeStore() {
    let ast = esprima.parseModule(this.fs.read(this.templatePath('store.js')));

    // Import the reducer
    ast = astUtils.newImport(
      ast,
      astUtils.importDefaultDeclaration('mainReducer', `reducers/${this._resolvedPath()}`)
    );

    // Import redux-thunk if included
    if (this.props.thunk) {
      ast = astUtils.newImport(
        ast,
        astUtils.importDefaultDeclaration('thunk', 'redux-thunk')
      );
    }

    // Find the variable to hold the path to the main reducer needed for HMR
    let mainReducerPathVariable = astUtils.findSingleVariableDeclaration(
      ast,
      'const',
      'mainReducerPath'
    );

    if (!mainReducerPathVariable) {
      throw new Error(
        'Could not find the declaration of the variable mainReducerPath in the store template'
      );
    }

    mainReducerPathVariable.declarations[0].init.value =
      'reducers/' + this._resolvedPath();
    mainReducerPathVariable.declarations[0].init.raw = `'reducers/${this._resolvedPath()}'`;

    // Find the middleware array
    let middlewareVariable = astUtils.findSingleVariableDeclaration(
      ast,
      'const',
      'middleware'
    );

    if (!middlewareVariable) {
      throw new Error(
        'Could not find the declaration of the variable middleware in the store template'
      );
    }
    if (
      !middlewareVariable.declarations[0].init ||
      middlewareVariable.declarations[0].init.type !== 'ArrayExpression'
    ) {
      throw new Error(
        'The middleware variable declarations right side is not an ArrayExpression'
      );
    }

    // Add the redux-thunk middleware if included
    if (this.props.thunk) {
      middlewareVariable.declarations[0].init.elements.push(
        astUtils.callExpression('applyMiddleware', [
          { type: 'Identifier', name: 'thunk' }
        ])
      );
    }

    // Write the new store file
    this.fs.write(
      this.destinationPath(`stores/${this._resolvedPath()}.js`),
      escodegen.generate(ast)
    );
  }
  writing() {
    this._writeRootReducer();
    this._writeStore();
  }
};
