import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as app from 'actions/app';
import App from 'components/App';

export default connect(
  state => state.app,
  dispatch => bindActionCreators({
    onInitialize: app.initialize,
  }, dispatch)
)(App);