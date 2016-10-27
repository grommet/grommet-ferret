// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Tile from 'grommet/components/Tile';
import Box from 'grommet/components/Box';
import Heading from 'grommet/components/Heading';
import EditIcon from 'grommet/components/icons/base/Edit';
import Anchor from 'grommet/components/Anchor';

class SizeTile extends Component {

  render () {
    let { item, role } = this.props;
    let editControl;
    if (this.props.editable && 'read only' !== role) {
      editControl = (
        <Anchor icon={<EditIcon />}
          path={`/virtual-machine-sizes/edit${item.uri}`}
          a11yTitle={`Edit ${item.name} Size`} />
      );
    }
    return (
      <Tile align="center" separator="all" pad='small' justify="between"
        size="small"
        onClick={this.props.onClick} selected={this.props.selected}>
        <Box align="center">
          <Heading tag="h3" align="center" strong={true}>
            {item.name}
          </Heading>
          <div>{item.vCpus || item.attributes.vCpus} vCPUs</div>
          <div>{item.memory || item.attributes.memory} GB Memory</div>
          <div>{item.diskSpace || item.attributes.diskSpace} GB Storage</div>
        </Box>
        {editControl}
      </Tile>
    );
  }
}

SizeTile.propTypes = {
  editable: PropTypes.bool,
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool
};

SizeTile.defaultProps = {
  editable: true
};

let select = (state) => {
  return {
    role: state.session.role
  };
};

// Using export default doesn't seem to pull in the defaultProps correctly
module.exports = connect(select)(SizeTile);
