'use strict';
const ReactReduxGenerator = require('../ReactReduxGenerator');
const _ = require('lodash');
const types = require('babel-types');
const astUtils = require('../astUtils');
const environment = require('./Environment');

const shared = ['path', 'style'];
const prompts = [
  {
    name: 'name',
    message: 'What will be the name of the new component?',
    when: function() {
      return !this.props.name;
    }
  },
  {
    name: 'type',
    message: 'What type of component do you need?',
    type: 'list',
    choices: [
      {
        value: 'standard',
        name: 'Standard'
      },
      {
        value: 'stateless',
        name: 'Stateless functional'
      },
      {
        value: 'section',
        name: 'Section component'
      }
    ],
    default: 'standard',
    when: function() {
      return !_.isString(this.props.type);
    }
  },
  {
    name: 'container',
    type: 'confirm',
    default: true,
    message: 'Do you want to include a container for this component?',
    when: function() {
      return !_.isBoolean(this.props.container);
    }
  },
  {
    name: 'stylesheet',
    type: 'confirm',
    default: false,
    message: 'Do you want to include a stylesheet for this component?',
    when: function() {
      return !_.isBoolean(this.props.stylesheet);
    }
  }
];

module.exports = class extends environment(ReactReduxGenerator) {
  constructor(args, options) {
    super(args, options, {
      shared,
      prompts,
      generatorName: 'Component'
    });

    this.option('type', {
      type: String,
      required: false,
      desc: 'The type of component'
    });
    this.option('container', {
      type: Boolean,
      required: false,
      desc: 'Include react-bootstrap in this component'
    });
    this.option('stylesheet', {
      type: Boolean,
      required: false,
      desc: 'Include a stylesheet with this component'
    });
  }
  initializing() {
    return this._initializing();
  }
  prompting() {
    return this._prompting();
  }
  get _componentName() {
    return _.upperFirst(this.props.name);
  }
  writing() {
    let ast = astUtils.parse(this._templateByTypeContents);

    if (this.props.style === 'Bootstrap') {
      ast = astUtils.importBootstrap(ast);
    } else if (this.props.style === 'Semantic UI') {
      ast = astUtils.importSemantic(ast);
    }

    if (this.props.stylesheet) {
      ast = astUtils.newImport(
        ast,
        types.importDeclaration([], types.stringLiteral('./' + this.props.name + '.scss'))
      );
    }

    let exportDefaultDeclaration = astUtils.findDefaultExportDeclaration(ast);

    if (this.props.type === 'stateless') {
      // Change function name
      astUtils.findSingleVariableDeclaration(
        ast,
        'const',
        'newComponent'
      ).declarations[0].id.name = this.props.name;

      // Change displayName
      let displayNameExpression = ast.program.body.find(
        stmt =>
          types.isExpressionStatement(stmt) &&
          types.isAssignmentExpression(stmt.expression) &&
          types.isMemberExpression(stmt.expression.left) &&
          stmt.expression.left.object.name === 'newComponent'
      ).expression;

      displayNameExpression.left.object.name = this.props.name;
      displayNameExpression.right.value = this._componentName;
      displayNameExpression.right.raw = `'${this._componentName}'`;

      exportDefaultDeclaration.declaration.name = this.props.name;
    } else {
      // Change class name
      astUtils.findClassDeclaration(ast, 'NewComponent').id.name = this._componentName;

      exportDefaultDeclaration.declaration.name = this._componentName;
    }

    this.fs.write(
      this.destinationPath(this._componentToCreateFilePath),
      astUtils.generate(ast)
    );

    if (this.props.stylesheet) {
      this.fs.write(this.destinationPath(this._stylesheetToCreateFilePath), '\n');
    }

    if (this.props.container) {
      let state;

      if (this.props.type === 'section') {
        state = types.memberExpression(
          types.memberExpression(types.identifier('state'), types.identifier('sections')),
          types.identifier(this.props.path)
        );
      }

      this.composeWith(require.resolve('../container'), {
        name: this.props.name,
        path: this.props.path,
        component: this._componentToCreateFilePath,
        state
      });
    }
  }
};
