// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { logout } from '../actions';
import Menu from 'grommet/components/Menu';
import Gravatar from 'react-gravatar';
import Drop from 'grommet/utils/Drop';

class SessionMenu extends Component {

  constructor() {
    super();
    this._onLogout = this._onLogout.bind(this);
  }

  _onLogout(event) {
    console.log('click callback');
    event.preventDefault();
    this.props.dispatch(logout());
  }

  render() {
    const { session: {email}, dropAlign } = this.props;
    var icon = <Gravatar email={email || ''} default="mm"/>;
    return (
      <Menu icon={icon} dropAlign={dropAlign} a11yTitle="Open Session Menu">
        <a tabIndex="0" href="#" onClick={this._onLogout}>Logout</a>
      </Menu>
    );
  }

}

SessionMenu.propTypes = {
  dropAlign: Drop.alignPropType,
  session: PropTypes.shape({
    email: PropTypes.string
  })
};

SessionMenu.defaultProps = {
  direction: 'down'
};

let select = (state) => ({session: state.session});

export default connect(select)(SessionMenu);
