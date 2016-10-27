// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import Box from 'grommet/components/Box';

class NetworkSuggestion extends Component {
  render () {
    return (
      <Box direction="row" justify="between">
        <span>{this.props.name}</span>
        <span className="secondary">{this.props.vLanId}</span>
      </Box>
    );
  }
}

NetworkSuggestion.propTypes = {
  name: PropTypes.string.isRequired,
  vLanId: PropTypes.number.isRequired
};

export default NetworkSuggestion;
