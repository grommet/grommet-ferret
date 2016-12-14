// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadActivityItem, unloadActivityItem,
  clearAlert, activateAlert } from '../../actions/actions';
import Layer from 'grommet/components/Layer';
import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Heading from 'grommet/components/Heading';
import StatusIcon from 'grommet/components/icons/Status';
import Footer from 'grommet/components/Footer';
import CheckBox from 'grommet/components/CheckBox';
import Meter from 'grommet/components/Meter';
import Value from 'grommet/components/Value';
import Paragraph from 'grommet/components/Paragraph';
import Timestamp from 'grommet/components/Timestamp';
import Duration from '../../utils/Duration';
import ActivityResourceLink from './ActivityResourceLink';

class ActivityItem extends Component {

  constructor () {
    super();
    this._onToggle = this._onToggle.bind(this);
    // this._onActivate = this._onActivate.bind(this);
  }

  componentDidMount () {
    this.props.dispatch(loadActivityItem(this.props.uri));
  }

  componentWillUnmount () {
    this.props.dispatch(unloadActivityItem());
  }

  _onToggle () {
    const item = this.props.activity.item;
    if ('Active' === item.state) {
      this.props.dispatch(clearAlert(this.props.activity.item));
    } else if ('Cleared' === item.state) {
      this.props.dispatch(activateAlert(this.props.activity.item));
    }
  }

  _renderTimestamp (item) {
    let result;
    if (item.created) {
      result = <Timestamp className="secondary" value={item.created} />;
    }
    return result;
  }

  _renderResource (item) {
    const { includeResource } = this.props;
    let result;
    if (includeResource && item.attributes) {
      result = <ActivityResourceLink item={item} />;
    }
    return result;
  }

  _renderOwner (item) {
    let result;
    if (item.owner || (item.attributes && item.attributes.owner)) {
      result = (
        <div className="secondary">
          by {item.owner || item.attributes.owner}
        </div>
      );
    }
    return result;
  }

  _renderState (item) {
    let result;
    if ('Running' === item.state) {
      let duration;
      if (item.created && item.modified) {
        duration = Duration(item.created, item.modified);
      }
      result = (
        <Box direction='row' pad={{ between: 'small' }}>
          <Meter size="small"
            value={item.percentComplete || 0}
            a11yTitle="Progress bar" />
          <Value size="small" value={item.percentComplete || 0} units="%" />
          <span className="secondary">{duration}</span>
        </Box>
      );
    }
    return result;
  }

  _renderDetails (item) {
    let result;
    if (item.taskErrors) {
      result = item.taskErrors.map((taskError, index) => {
        return (
          <div key={index}>
            <Paragraph>{taskError.message}</Paragraph>
            <Heading tag="h3">Resolution</Heading>
            {taskError.recommendedActions}
          </div>
        );
      });
    }
    return result;
  }

  _renderChild (child, index) {
    const separator = (0 === index ? 'horizontal' : 'bottom');
    let timestamp = this._renderTimestamp(child);
    let resource = this._renderResource(child);
    let state = this._renderState(child);
    let details = this._renderDetails(child);
    return (
      <Box key={child.uri} pad={{vertical: 'medium'}} separator={separator}>
        <Box direction="row" pad={{between: 'large'}}>
          <Box pad="small">
            <StatusIcon value={child.status} />
          </Box>
          <Box>
            <Heading tag="h3">{child.name}</Heading>
            {timestamp}
            {resource}
            {state}
            {details}
          </Box>
        </Box>
      </Box>
    );
  }

  render () {
    let { activity: {item, children}, role } = this.props;

    let timestamp = this._renderTimestamp(item);
    let owner = this._renderOwner(item);

    let sub;
    if (timestamp || owner) {
      sub = (
        <Box direction="row" justify="between" pad={{between: 'small'}}>
          {owner}{timestamp}
        </Box>
      );
    }

    let footer;
    if ('read only' !== role &&
      ('Active' === item.state || 'Cleared' === item.state)) {
      footer = (
        <Footer pad={{vertical: 'medium'}}>
          <CheckBox id="state" label={item.state} toggle={true}
            checked={'Active' === item.state}
            onChange={this._onToggle} />
        </Footer>
      );
    }

    let resource = this._renderResource(item);
    let state = this._renderState(item);
    let details = this._renderDetails(item);

    let childTasks;
    if (children) {
      childTasks = children.items.map(this._renderChild, this);
    }

    return (
      <Layer align="center" closer={true} onClose={this.props.onClose}
        a11yTitle='Activity Item'>
        <Article pad={{vertical: 'large', between: 'large'}} >
          <Box pad={{between: 'large'}}
            direction="row">
            <StatusIcon value={item.status} size="large" />
            <Box>
              <Heading tag="h2" margin="none">{item.name}</Heading>
              {resource}
              {sub}
              {state}
              {details}
              {footer}
            </Box>
          </Box>
          <div>
            {childTasks}
          </div>
        </Article>
      </Layer>
    );
  }
}

ActivityItem.propTypes = {
  activity: PropTypes.object,
  includeResource: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  role: PropTypes.string,
  uri: PropTypes.string.isRequired
};

let select = (state, props) => {
  return {
    activity: state.activity,
    role: state.session.role
  };
};

export default connect(select)(ActivityItem);
