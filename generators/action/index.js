'use strict';
const ReactReduxGenerator = require('../ReactReduxGenerator');
const types = require('babel-types');
const astUtils = require('../astUtils');

const shared = ['path'];
const prompts = [
  {
    name: 'name',
    message: 'What will be the name of the action?',
    when: function() {
      return !this.props.name;
    }
  }
];

module.exports = class extends ReactReduxGenerator {
  constructor(args, options) {
    super(args, options, {
      shared,
      prompts,
      generatorName: 'Action'
    });
  }
  initializing() {
    return this._initializing();
  }
  prompting() {
    return this._prompting();
  }
  writing() {
    let ast = astUtils.parse(this.fs.read(this.templatePath('action.js')));

    astUtils.findSingleVariableDeclaration(
      ast,
      'const',
      'actionPrefix'
    ).declarations[0].init = types.stringLiteral(this._resolvedPath);

    this.fs.write(this.destinationPath(this._actionsFilePath), astUtils.generate(ast));
  }
};
