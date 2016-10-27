// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadNotifications, updateNotifications, unloadNotifications }
  from '../actions/actions';
import Section from 'grommet/components/Section';
import Notification from 'grommet/components/Notification';
import ActivityItem from './activity/ActivityItem';
import Anchor from 'grommet/components/Anchor';

class Notifications extends Component {

  constructor () {
    super();
    this._onClickNotification = this._onClickNotification.bind(this);
    this._onCloseActivityItem = this._onCloseActivityItem.bind(this);

    this.state = {
      notificationItem: null
    };
  }

  componentDidMount () {
    const { aggregate, context, count, includeCategories } = this.props;
    this.props.dispatch(loadNotifications({
      aggregate: aggregate,
      context: context,
      count: count,
      includeCategories: includeCategories
    }));
  }

  componentWillReceiveProps (nextProps) {
    const { context, notifications } = this.props;
    const { context: nextContext, notifications: nextNotifications,
      preservePriorRunningTasks} = nextProps;
    if (context.uri !== nextContext.uri ||
      context.category !== nextContext.category) {
      const preserveUris = (preservePriorRunningTasks ?
        nextNotifications.preserveUris : undefined);
      this.props.dispatch(loadNotifications({
        aggregate: nextProps.aggregate,
        context: nextProps.context,
        count: nextProps.count,
        includeCategories: nextProps.includeCategories,
        preserveUris: preserveUris
      }));
    } else if (preservePriorRunningTasks &&
      (nextNotifications.preserveUris.length !==
      notifications.preserveUris.length ||
      (nextNotifications.preserveUris.length > 0 &&
        nextNotifications.preserveUris[0] !== notifications.preserveUris[0]))) {
      this.props.dispatch(updateNotifications(nextNotifications));
    }
  }

  componentWillUnmount () {
    this.props.dispatch(unloadNotifications());
  }

  _onClickNotification (item) {
    this.setState({ notificationItem: item });
  }

  _onCloseActivityItem () {
    this.setState({ notificationItem: null });
  }

  _onClickAggregate () {
    // no-op
  }

  _renderItem (item) {
    let result;
    if (item) {
      let state, timestamp, percentComplete;
      if ('tasks' === item.category) {
        state = item.state;
        percentComplete = item.percentComplete;
      } else {
        timestamp = item.created;
      }
      let resourceName;
      if (this.props.includeResource) {
        resourceName = item.attributes.associatedResourceName;
      }
      result = (
        <Notification key={item.uri} pad="medium"
          status={item.status}
          message={item.name}
          context={resourceName}
          state={state}
          percentComplete={percentComplete}
          timestamp={timestamp}
          onClick={this._onClickNotification.bind(this, item)} />
      );
    }
    return result;
  }

  _renderList (items, aggregate) {
    let result;
    if (items) {
      result = items.map(item => this._renderItem(item));
    }
    return result;
  }

  _renderAggregate (aggregate) {
    let result;
    if (aggregate && aggregate.count > 1) {
      let message = aggregate.count.toString(10) + ' ' +
        aggregate.status.toLowerCase() + ' alerts';
      result = (
        <Anchor path={aggregate.path} className="plain">
          <Notification pad="medium" status={aggregate.status} message={message}
            onClick={this._onClickAggregate} />
        </Anchor>
      );
    }
    return result;
  }

  render() {
    const {
      notifications: {aggregate, alert, tasks}, includeResource
    } = this.props;

    let activityItem;
    if (this.state.notificationItem) {
      activityItem = (
        <ActivityItem uri={this.state.notificationItem.uri}
          includeResource={includeResource}
          onClose={this._onCloseActivityItem} />
      );
    }

    let single = this._renderItem(alert);
    let list = this._renderList(tasks);
    let aggregated = this._renderAggregate(aggregate);

    return (
      <Section full="horizontal" pad="none">
        {aggregated}
        {single}
        {list}
        {activityItem}
      </Section>
    );
  }
}

Notifications.propTypes = {
  aggregate: PropTypes.bool,
  context: PropTypes.oneOfType([
    PropTypes.shape({ global: PropTypes.boolean }),
    PropTypes.shape({ category: PropTypes.string }),
    PropTypes.shape({ uri: PropTypes.string })
  ]).isRequired,
  count: PropTypes.number,
  includeResource: PropTypes.bool,
  notifications: PropTypes.object,
  preservePriorRunningTasks: PropTypes.bool,
  includeCategories: PropTypes.oneOfType([
    PropTypes.oneOf(['alerts', 'tasks']),
    PropTypes.arrayOf(PropTypes.oneOf(['alerts', 'tasks']))
  ])
};

Notifications.defaultProps = {
  aggregate: true,
  includeCategories: ['alerts', 'tasks'],
  preservePriorRunningTasks: true
};

let select = (state, props) => ({
  notifications: state.notifications
});

export default connect(select)(Notifications);
