// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import Box from 'grommet/components/Box';

export default class SizeSuggestion extends Component {

  render () {
    let { size } = this.props;
    return (
      <Box direction="column">
        <div>{size.name}</div>
        <div className="secondary">
          <span>{size.vCpus || size.attributes.vCpus} vCPUs, </span>
          <span>{size.memory || size.attributes.memory} GB Memory, </span>
          <span>{size.diskSpace || size.attributes.diskSpace} GB Storage</span>
        </div>
      </Box>
    );
  }
}

SizeSuggestion.propTypes = {
  size: PropTypes.object.isRequired
};
