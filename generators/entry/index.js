'use strict';
const ReactReduxGenerator = require('../ReactReduxGenerator');
const environment = require('./Environment');
const chalk = require('chalk');
const assert = require('chai').assert;
const types = require('babel-types');
const astUtils = require('../astUtils');

const shared = ['style', 'thunk', 'path', 'normalizr', 'form'];
const prompts = [
  {
    name: 'name',
    message: 'What will be the name of the new entry?',
    when: function() {
      return !this.props.name;
    }
  }
];

module.exports = class extends environment(ReactReduxGenerator) {
  constructor(args, options) {
    super(args, options, {
      shared,
      prompts,
      generatorName: 'Entry'
    });

    this.option('skipEntryDirectory', {
      type: Boolean,
      required: false,
      default: false,
      desc: 'Do not create a directory for the entry and template files'
    });
  }

  initializing() {
    return this._initializing();
  }
  prompting() {
    return this._prompting().then(() => {
      this.composeWith(require.resolve('../store'), {
        name: this.props.name,
        thunk: this.props.thunk,
        normalizr: this.props.normalizr,
        form: this.props.form,
        path: this.props.path
      });

      this.composeWith(require.resolve('../reducer'), {
        name: this.props.name,
        path: this.props.path,
        type: 'section',
        actions: this._relatedActions
      });

      this.composeWith(require.resolve('../component'), {
        name: 'index',
        path: this.props.name,
        style: this.props.style,
        container: true,
        type: 'section'
      });
    });
  }
  validating() {
    if (this.fs.exists(this.destinationPath(this._jsEntryFilePath))) {
      this.log('');
      this.log(
        chalk.yellow('Entry ') +
          chalk.green(this.props.name) +
          chalk.yellow(' aldready exists, you cannot override an entry')
      );
      this.aborted = true;
      this.env.error(
        `File ${this.destinationPath(this._jsEntryFilePath)} already exists. Aborting`
      );
    }
  }
  _writeJSEntry() {
    let ast = astUtils.parse(this.fs.read(this.templatePath('entry.js')));

    // Import the main container
    ast = astUtils.newImport(
      ast,
      astUtils.singleSpecifierImportDeclaration('Main', this._defaultContainerPath, true)
    );
    // Import the store
    ast = astUtils.newImport(
      ast,
      astUtils.singleSpecifierImportDeclaration('configureStore', this._storePath, true)
    );

    // Set the main container path variable to be used by HMR
    let mainContainerPathVariable = astUtils.findSingleVariableDeclaration(
      ast,
      'const',
      'mainContainerPath'
    );

    assert.isOk(
      mainContainerPathVariable,
      'Could not find the declaration of the variable mainContainerPath in the JS entry template'
    );

    mainContainerPathVariable.declarations[0].init.value = this._defaultContainerPath;
    mainContainerPathVariable.declarations[0].init.raw = `'${this
      ._defaultContainerPath}'`;

    // Write the ast and the untouched part of the file
    this.fs.write(this.destinationPath(this._jsEntryFilePath), astUtils.generate(ast));
  }
  _writeHTMLTemplate() {
    this.fs.copy(
      this.templatePath('static/index.ejs'),
      this.destinationPath(this._htmlEntryFilePath)
    );
  }
  _entriesFileIncosistentError(details) {
    return (
      'Unable to edit the entries file in src/webpack/entries.js , you will have to manually add the JavaScript and HTML entries: ' +
      details
    );
  }
  writing() {
    this._writeJSEntry();
    this._writeHTMLTemplate();

    if (this.fs.exists(this.destinationPath('webpack/entries.js'))) {
      // Add the entry into the entries file
      let ast = astUtils.parse(this.fs.read(this.destinationPath('webpack/entries.js')));

      // Check the consistency of the entries file so we dont break anything
      types.assertProgram(ast.program);
      types.assertExpressionStatement(ast.program.body[0]);

      let expression = ast.program.body[0].expression;

      types.assertAssignmentExpression(expression);
      types.assertMemberExpression(expression.left);

      assert.strictEqual(
        expression.left.object.name,
        'module',
        this._entriesFileIncosistentError(
          'Left side of the assignment must be a MemberExpression for the object module'
        )
      );
      assert.strictEqual(
        expression.left.property.name,
        'exports',
        this._entriesFileIncosistentError(
          'Left side of the assignment must be a MemberExpression for the property exports'
        )
      );

      types.assertObjectExpression(expression.right);

      // Finally add the entry
      expression.right.properties.push(
        types.objectProperty(
          types.identifier(this.props.name),
          types.stringLiteral(this._jsEntryFilePath)
        )
      );

      this.fs.write(this.destinationPath('webpack/entries.js'), astUtils.generate(ast));
    }
  }
};
