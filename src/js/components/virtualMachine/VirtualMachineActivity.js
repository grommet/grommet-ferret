// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import List from 'grommet/components/List';
import ActivityListItem from '../activity/ActivityListItem';
import ActivityItem from '../activity/ActivityItem';

class VirtualMachineActivity extends Component {

  constructor () {
    super();
    this._onSelect = this._onSelect.bind(this);
    this._onDeselect = this._onDeselect.bind(this);
    this.state = {};
  }

  _onSelect (selection) {
    this.setState({ selection: selection });
  }

  _onDeselect () {
    this.setState({ selection: undefined });
  }

  render () {
    const { activity } = this.props;
    const { selection } = this.state;

    const items = (activity || { items: [] }).items.map((item, index) => (
      <ActivityListItem key={item.uri} item={item} index={index} />
    ));

    let activityItem;
    if (selection >= 0) {
      const uri = activity.items[selection].uri;
      activityItem = (
        <ActivityItem uri={uri} onClose={this._onDeselect} />
      );
    }

    return (
      <div>
        <List selectable={true} onSelect={this._onSelect}>
          {items}
        </List>
        {activityItem}
      </div>
    );
  }
}

VirtualMachineActivity.propTypes = {
  activity: PropTypes.object,
  uri: PropTypes.string.isRequired
};

let select = (state, props) => {
  return {
    activity: state.item.activity
  };
};

export default connect(select)(VirtualMachineActivity);
