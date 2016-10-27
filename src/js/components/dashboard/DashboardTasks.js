// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import List from 'grommet/components/List';
import ActivityListItem from '../activity/ActivityListItem';
import ActivityItem from '../activity/ActivityItem';

class ActiveGlobalListItem extends ActivityListItem {
}

ActiveGlobalListItem.defaultProps = {
  includeResource: true
};

class ActivityGlobalItem extends ActivityItem {
}

ActivityGlobalItem.defaultProps = {
  includeResource: true
};

class DashboardTasks extends Component {

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
    const { tasks } = this.props;
    const { selection } = this.state;

    const items = (tasks || { items: [] }).items.map((item, index) => (
      <ActiveGlobalListItem key={item.uri} item={item} index={index} />
    ));

    let activityItem;
    if (selection >= 0) {
      const uri = tasks.items[selection].uri;
      activityItem = (
        <ActivityGlobalItem uri={uri} onClose={this._onDeselect} />
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

DashboardTasks.propTypes = {
  tasks: PropTypes.object
};

export default connect()(DashboardTasks);
