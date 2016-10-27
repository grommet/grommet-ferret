// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import Box from 'grommet/components/Box';
import Menu from 'grommet/components/Menu';
import Button from 'grommet/components/Button';
import TransactionIcon from 'grommet/components/icons/base/Transaction';
import TrashIcon from 'grommet/components/icons/base/Trash';
import Timestamp from 'grommet/components/Timestamp';

class VirtualMachineSnapshots extends Component {

  _onRevert (uri) {
    // TODO:
  }

  _onRemove (uri) {
    // TODO:
  }

  _renderSnapshot (snapshot, index) {
    return (
      <ListItem key={snapshot.uri} direction="row" align="center"
        pad={{horizontal: 'medium', vertical: 'small', between: 'medium'}}
        justify="between" separator={index === 0 ? 'horizontal' : 'bottom'}>
        <strong>{snapshot.name}</strong>
        <Box direction="row" align="center" pad={{between: 'medium'}}>
          <Timestamp value={snapshot.created} align="end" />
          <Menu inline={false} dropAlign={{top: 'top', right: 'right'}}>
            <Button plain={true} icon={<TransactionIcon />} label="Revert"
              onClick={this._onRevert.bind(this, snapshot.uri)} />
            <Button plain={true} icon={<TrashIcon />} label="Remove"
              onClick={this._onRemove.bind(this, snapshot.uri)} />
          </Menu>
        </Box>
      </ListItem>
    );
  }

  render () {
    const { snapshots } = this.props;
    let items = snapshots.items.map((snapshot, index) => {
      return this._renderSnapshot(snapshot, index);
    });
    return (
      <List>
        {items}
      </List>
    );
  }
}

VirtualMachineSnapshots.propTypes = {
  snapshots: PropTypes.object
};

let select = (state, props) => {
  return {
    snapshots: state.vm.snapshots
  };
};

export default connect(select)(VirtualMachineSnapshots);
