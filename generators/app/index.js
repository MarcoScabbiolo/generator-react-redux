'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const extend = require('deep-extend');
const sharedOptions = require('../options');
const sharedPrompts = require('../prompts');
const astUtils = require('../astUtils');
const types = require('babel-types');
const _ = require('lodash');

const shared = ['style', 'thunk', 'form', 'normalizr'];

module.exports = class extends Generator {
  constructor(args, options) {
    super(args, options);

    this.option('webpackdashboard', {
      type: Boolean,
      required: false,
      desc: 'Use webpack-dashboard'
    });

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

    return this.prompt(
      sharedPrompts.get(this.props, shared).concat([
        {
          message: 'Use webpack-dashboard?',
          name: 'webpackdashboard',
          type: 'confirm',
          default: false,
          store: true,
          when: !_.isBoolean(this.options.webpackdashboard)
        }
      ])
    ).then(props => {
      this.props = extend(this.props, props);
      this.config.set({
        styleEnabled: this.props.style,
        thunkEnabled: this.props.thunk,
        formsEnabled: this.props.form
      });
      this.config.save();

      this.composeWith(require.resolve('../entry'), {
        style: this.props.style,
        name: 'main',
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

    if (this.props.style === 'Bootstrap') {
      component = astUtils.importBootstrap(component);
      component = astUtils.newImport(
        component,
        types.importDeclaration(
          [],
          types.stringLiteral('../../node_modules/bootstrap/dist/css/bootstrap.css')
        )
      );
      component = astUtils.newImport(
        component,
        types.importDeclaration(
          [],
          types.stringLiteral('../../node_modules/bootstrap/dist/css/bootstrap-theme.css')
        )
      );
    }

    this.fs.write(
      this.destinationPath('src/components/App.js'),
      astUtils.generate(component)
    );

    let pkg = this._extendJSON('package.json', undefined, false);

    switch (this.props.style) {
      case 'Bootstrap':
        pkg.dependencies['react-bootstrap'] = '^0.31.3';
        pkg.dependencies.bootstrap = '^3.3.7';
        break;
      case 'Semantic UI':
        pkg.dependencies['semantic-ui-react'] = '^0.76.0';
        break;
    }
    if (this.props.webpackdashboard) {
      pkg.devDependencies['webpack-dashboard'] = '^1.0.2';
      pkg.scripts.start = 'webpack-dashboard -- ' + pkg.scripts.start;
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

    let webpack = this.fs.readJSON(this.templatePath('webpack-config.json'), {});
    webpack.dashboard = this.props.webpackdashboard;
    this.fs.writeJSON(this.destinationPath('webpack/config.json'), webpack);

    this._extendJSON('.babelrc');
  }

  install() {
    this.installDependencies({ bower: false });
  }
};
