// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import Tile from 'grommet/components/Tile';
import Box from 'grommet/components/Box';
import StatusIcon from 'grommet/components/icons/Status';
import Timestamp from 'grommet/components/Timestamp';
import Meter from 'grommet/components/Meter';
import Value from 'grommet/components/Value';
import Duration from '../../utils/Duration';
import NextIcon from 'grommet/components/icons/base/Next';

export default class ActivityTile extends Component {

  render() {
    const { item, includeResource } = this.props;

    let icon;
    if ('Active' === item.state || 'Locked' === item.state) {
      icon = <StatusIcon value={item.status} size="small" />;
    }

    let duration;
    if (item.created && item.modified) {
      duration = Duration(item.created, item.modified);
    }

    let state;
    if ('Running' === item.state) {
      state = (
        <span>
          <Meter size="small"
            value={item.percentComplete || 0}
            a11yTitle="Progress bar" />
          <Value size="small" value={item.percentComplete || 0} units="%" />
          <span className="secondary">{duration}</span>
        </span>
      );
    } else {
      state = <Timestamp className="secondary" value={item.created} />;
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
      <Tile pad="small" separator="bottom"
        direction="row" justify="between" align="center" responsive={false}
        onClick={this.props.onClick} selected={this.props.selected}>
        <Box direction="column">
          {icon}
          {item.name}
          {resource}
          {owner}
          {state}
        </Box>
        <NextIcon />
      </Tile>
    );
  }
}

ActivityTile.propTypes = {
  includeResource: PropTypes.bool,
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool
};
