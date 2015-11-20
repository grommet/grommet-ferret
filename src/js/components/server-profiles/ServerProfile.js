// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import MonitorIcon from 'grommet/components/icons/base/Monitor';
import PowerIcon from 'grommet/components/icons/base/Power';
import Item from '../Item';

class ServerProfile extends Component {

  constructor () {
    super();

    this._onConsole.bind(this);
    this._onPower.bind(this);
  }

  _onConsole () {
    // no-op
  }

  _onPower () {
    // no-op
  }

  render () {
    return (
      <Item uri={this.props.params.splat}>
        <Box pad="small" />
        <Box pad="medium">
          <Button label={<span><MonitorIcon /> Console</span>}
            fill={true}
            onClick={this._onConsole} />
        </Box>
        <Box pad="medium">
          <Button label={<span><PowerIcon /> Power</span>}
            fill={true}
            onClick={this._onPower} />
        </Box>
      </Item>
    );
  }
}

export default ServerProfile;
