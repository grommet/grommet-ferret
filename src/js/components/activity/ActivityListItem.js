// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import ListItem from 'grommet/components/ListItem';
import Box from 'grommet/components/Box';
import StatusIcon from 'grommet/components/icons/Status';
import Timestamp from 'grommet/components/Timestamp';
import Meter from 'grommet/components/Meter';
import Value from 'grommet/components/Value';
import Duration from '../../utils/Duration';

export default class ActivityListItem extends Component {

  render() {
    const { item, index, onlyActiveStatus, includeResource } = this.props;

    let separator;
    if (0 === index) {
      separator = 'horizontal';
    }

    let icon;
    if (! onlyActiveStatus ||
      'Active' === item.state || 'Locked' === item.state ||
      'Error' === item.state) {
      icon = <StatusIcon value={item.status} size="small" />;
    } else {
      icon = <StatusIcon value="blank" size="small" />;
    }

    let duration;
    if (item.created && item.modified) {
      duration = Duration(item.created, item.modified);
    }

    let state;
    if ('Running' === item.state) {
      state = (
        <Box direction="row"
          pad={{between: 'small'}} align="center">
          <Meter size="small"
            value={item.percentComplete || 0}
            a11yTitle="Progress bar" />
          <Value align="start" size="small"
            value={item.percentComplete || 0} units="%" />
          <span className="secondary">{duration}</span>
        </Box>
      );
    } else {
      state = (
        <Box direction="row" responsive={false} pad={{between: 'small'}}>
          <span key="state" className="secondary">{item.state}</span>
          <Timestamp key="timestamp" value={item.created} align="end" />
        </Box>
      );
    }

    let resource;
    if (includeResource) {
      resource = <strong>{item.attributes.associatedResourceName}</strong>;
    }

    let owner;
    if ('tasks' === item.category) {
      owner = (
        <span className="secondary">by {item.attributes.owner}</span>
      );
    }

    return (
      <ListItem align="start" justify="between" separator={separator}
        pad={{horizontal: 'medium', vertical: 'medium', between: 'medium'}}
        onClick={this.props.onClick} selected={this.props.selected}>
        <Box direction="row" pad={{between: 'small'}}>
          {icon}
          <span className="message">
            {item.name} {resource} {owner}
          </span>
        </Box>
        {state}
      </ListItem>
    );
  }
}

ActivityListItem.propTypes = {
  includeResource: PropTypes.bool,
  index: PropTypes.number,
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  onlyActiveStatus: PropTypes.bool,
  selected: PropTypes.bool
};
