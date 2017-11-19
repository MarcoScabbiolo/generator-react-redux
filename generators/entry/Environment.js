const path = require('path');

class DummyBaseClass {}

module.exports = (BaseClass = DummyBaseClass) =>
  class extends BaseClass {
    get _htmlEntryFilePath() {
      let basePath = this.props.skipEntryDirectory
        ? this.props.name
        : this._resolvePath();
      return path.join('src', basePath + '.ejs');
    }
    get _relatedActions() {
      let actions = { app: 'actions/app' };
      actions[this.props.name] = this._actionsPath;
      return actions;
    }
  };
