import React, { Component } from 'react';
import PropTypes from 'prop-types';

class App extends Component {
  static propTypes = {
    initialized: PropTypes.bool.isRequired,
    onInitialize: PropTypes.func.isRequired
  };
  componentDidMount() {
    this.props.onInitialize();
  }
  render() {
    return (
      <div className="app">
        { this.props.initialized ? this.props.children : undefined }
      </div>
    );
  }
}

export default App;