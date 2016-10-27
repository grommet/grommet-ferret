// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { sessionLogout } from '../actions/session';
import { routePlay, routeStop } from '../actions/route';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import Button from 'grommet/components/Button';
import Box from 'grommet/components/Box';
import Heading from 'grommet/components/Heading';
import UserIcon from 'grommet/components/icons/base/User';

class SessionMenu extends Component {

  constructor() {
    super();
    this._onLogout = this._onLogout.bind(this);
    this._onPlay = this._onPlay.bind(this);
    this._onStop = this._onStop.bind(this);
  }

  _onLogout(event) {
    event.preventDefault();
    this.props.dispatch(sessionLogout());
  }

  _onPlay () {
    this.props.dispatch(routePlay());
  }

  _onStop () {
    this.props.dispatch(routeStop());
  }

  render() {
    const { dropAlign, colorIndex, userName, routePlaying, enableAutoPlay } =
      this.props;
    let routeControl;
    if (enableAutoPlay) {
      if (routePlaying) {
        routeControl = (
          <Button label="Stop auto play" onClick={this._onStop} />
        );
      } else {
        routeControl = (
          <Button label="Start auto play" onClick={this._onPlay} />
        );
      }
    }
    return (
      <Menu icon={<UserIcon />} dropAlign={dropAlign}
        colorIndex={colorIndex} a11yTitle="Session">
        <Box pad="medium">
          <Heading tag="h3" margin="none">{userName}</Heading>
        </Box>
        {routeControl}
        <Anchor href="#" onClick={this._onLogout} label="Logout" />
      </Menu>
    );
  }

}

SessionMenu.propTypes = {
  colorIndex: PropTypes.string,
  dropAlign: Menu.propTypes.dropAlign,
  routePlaying: PropTypes.bool,
  userName: PropTypes.string
};

let select = (state) => ({
  enableAutoPlay: state.session.enableAutoPlay,
  routePlaying: state.route.playing,
  userName: state.session.userName
});

export default connect(select)(SessionMenu);
