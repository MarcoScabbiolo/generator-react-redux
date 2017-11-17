'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const extend = require('deep-extend');
const sharedOptions = require('../options');
const sharedPrompts = require('../prompts');
const astUtils = require('../astUtils');

const shared = ['bootstrap', 'thunk', 'form', 'normalizr'];

module.exports = class extends Generator {
  constructor(args, options) {
    super(args, options);

    sharedOptions.include(this.option.bind(this), shared, this.log.bind(this));
  }
  initializing() {
    this.props = Object.assign({}, this.options);
    this.composeWith(require.resolve('generator-node/generators/app'), {
      boilerplate: false,
      skipInstall: this.options.skipInstall,
      license: this.options.license
    });
  }
  prompting() {
    this.log('');
    this.log(chalk.green('React & Redux') + ' generator. Feel free to contribute!');
    this.log('');

    return this.prompt(sharedPrompts.get(this.props, shared)).then(props => {
      this.props = extend(this.props, props);
      this.config.set({
        bootstrapEnabled: this.props.bootstrap,
        thunkEnabled: this.props.thunk,
        formsEnabled: this.props.form
      });
      this.config.save();

      this.composeWith(require.resolve('../entry'), {
        name: 'index',
        bootstrap: this.props.bootstrap,
        thunk: this.props.thunk,
        normalizr: this.props.normalizr,
        form: this.props.form,
        path: '',
        skipEntryDirectory: true
      });
    });
  }
  _extendJSON(target, source, write = true) {
    source = source || target;
    let json = {};
    if (this.fs.exists(this.destinationPath(target))) {
      json = this.fs.readJSON(this.destinationPath(target), {});
    }
    json = extend(json, this.fs.readJSON(this.templatePath(source), {}));

    if (write) {
      this.fs.writeJSON(this.destinationPath(target), json);
    } else {
      return json;
    }
  }
  writing() {
    this.fs.copy(this.templatePath('static/**'), this.destinationRoot());
    this.fs.copy(this.templatePath('static/**/.*'), this.destinationRoot());

    let component = astUtils.parse(this.fs.read(this.templatePath('component.js')));

    if (this.props.bootstrap) {
      component = astUtils.importBootstrap(component);
    }

    this.fs.write(
      this.destinationPath('src/components/App.js'),
      astUtils.generate(component)
    );

    let pkg = this._extendJSON('package.json', undefined, false);

    if (this.props.bootstrap) {
      pkg.dependencies['react-bootstrap'] = '^0.31.3';
    }
    if (this.props.semanticui) {
      pkg.dependencies['semantic-ui-react'] = '^0.76.0';
    }
    if (this.props.thunk) {
      pkg.dependencies['redux-thunk'] = '^2.2.0';
    }
    if (this.props.form) {
      pkg.dependencies['redux-form'] = '^7.1.1';
    }
    if (this.props.normalizr) {
      pkg.dependencies.normalizr = '^3.2.4';
    }

    pkg.scripts.pretest += ' --fix';

    this.fs.writeJSON(this.destinationPath('package.json'), pkg);

    this._extendJSON('.babelrc');
  }

  install() {
    this.installDependencies({ bower: false });
  }
};
