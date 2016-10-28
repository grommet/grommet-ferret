// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { sessionLogin } from '../actions/session';
import { navEnable } from '../actions/nav';
import Split from 'grommet/components/Split';
import Sidebar from 'grommet/components/Sidebar';
import LoginForm from 'grommet/components/LoginForm';
import Footer from 'grommet/components/Footer';
import Logo from './Logo';
import Promo from './Promo';

class Login extends Component {

  constructor (props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
    this._setDocumentTitle(props);
    this.state = { busy: false };
  }

  componentDidMount () {
    this.props.dispatch(navEnable(false));
  }

  componentWillReceiveProps (nextProps) {
    this._setDocumentTitle(nextProps);
    if (this.state.busy) {
      this.setState({ busy: false });
    }
  }

  componentWillUnmount () {
    this.props.dispatch(navEnable(true));
  }

  _setDocumentTitle (props) {
    document.title = `Login - ${props.productName || ''}`;
  }

  _onSubmit (fields) {
    this.setState({ busy: true });
    this.props.dispatch(sessionLogin('', fields.username, fields.password));
  }

  render () {
    const { session } = this.props;

    var loginError = session.error;

    return (
      <Split flex="left" separator={true}>
        <Promo />
        <Sidebar justify="between" align="center" pad="none" size="large">
          <span />
          <LoginForm align="start"
            logo={<Logo size="large" busy={this.state.busy} />}
            title={this.props.productName}
            onSubmit={this.state.busy ? null : this._onSubmit}
            errors={[loginError]}
            usernameType="text" />
          <Footer direction="row" size="small"
            pad={{horizontal: 'medium', vertical: 'small', between: 'small'}}>
            <span className="secondary">&copy; 2016 Grommet Labs</span>
          </Footer>
        </Sidebar>
      </Split>
    );
  }
}

Login.propTypes = {
  session: PropTypes.shape({
    error: PropTypes.string
  })
};

let select = (state) => ({
  productName: state.settings.productName.short,
  session: state.session
});

export default connect(select)(Login);
