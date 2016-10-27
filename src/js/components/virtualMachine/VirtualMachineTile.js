// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import Tile from 'grommet/components/Tile';
import StatusIcon from 'grommet/components/icons/Status';

class VirtualMachineTile extends Component {

  render() {
    let item = this.props.item;
    return (
      <Tile align="stretch" pad="small" direction="column" size="small"
        href={`/virtual-machines${item.uri}`}
        onClick={this.props.onClick} selected={this.props.selected}
        a11yTitle={`View ${item.name} Virtual Machine`}>
        <strong>{item.name}</strong>
        <div>
          <StatusIcon value={item.status} size="small" />
          <span className="secondary">{item.state}</span>
        </div>
      </Tile>
    );
  }
}

VirtualMachineTile.propTypes = {
  editable: PropTypes.bool,
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool
};

VirtualMachineTile.defaultProps = {
  editable: true
};

// Using export default doesn't seem to pull in the defaultProps correctly
module.exports = VirtualMachineTile;
