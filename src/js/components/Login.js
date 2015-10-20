// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { login } from '../actions';
import Split from 'grommet/components/Split';
import Section from 'grommet/components/Section';
import Sidebar from 'grommet/components/Sidebar';
import LoginForm from 'grommet/components/LoginForm';
import Logo from './Logo';

class IndexerLogin extends Component {

  constructor() {
    super();
    this._onSubmit = this._onSubmit.bind(this);
  }

  _onSubmit(fields) {
    const { dispatch } = this.props;
    dispatch(login(fields.username, fields.password));
  }

  render() {
    const { session } = this.props;
    var loginError = session.error;
    var errors = [];
    if (loginError) {
      var message;
      var resolution;
      message = loginError.message;
      if (loginError.resolution) {
        resolution = loginError.resolution;
      }
      errors.push(message);
      errors.push(resolution);
    }
    return (
      <Split flex="left" separator={true}>
        <Section full={true} pad="none" texture="url(img/vaults.jpg)" />
        <Sidebar justify="center" align="center" pad="medium" size="large">
          <LoginForm
            logo={<Logo size="large" />}
            title="Ferret"
            onSubmit={this._onSubmit}
            errors={errors} />
        </Sidebar>
      </Split>
    );
  }
}

IndexerLogin.propTypes = {
  session: PropTypes.shape({
    email: PropTypes.string,
    error: PropTypes.string,
    token: PropTypes.string
  })
};

let select = (state) => ({session: state.session});

export default connect(select)(IndexerLogin);
