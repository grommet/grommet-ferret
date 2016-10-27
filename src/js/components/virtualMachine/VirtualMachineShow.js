// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadItem, loadItemActivity, unloadItem,
  vmResponsive, loadVmSnapshots, unloadVmSnapshots
} from '../../actions/actions';
import Split from 'grommet/components/Split';
import Article from 'grommet/components/Article';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Section from 'grommet/components/Section';
import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor';
import Button from 'grommet/components/Button';
import Notification from 'grommet/components/Notification';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import LinkPreviousIcon from 'grommet/components/icons/base/LinkPrevious';
import MoreIcon from 'grommet/components/icons/base/More';
import Notifications from '../Notifications';
import VirtualMachineActivity from './VirtualMachineActivity';
import VirtualMachineSnapshots from './VirtualMachineSnapshots';
import VirtualMachineMetrics from './VirtualMachineMetrics';
import VirtualMachineActions from './VirtualMachineActions';

class VirtualMachineShow extends Component {

  constructor (props) {
    super(props);
    this._onResponsive = this._onResponsive.bind(this);
    this._onToggleSidebar = this._onToggleSidebar.bind(this);

    this.state = {
      layerName: undefined,
      showSidebarWhenSingle: false
    };
  }

  componentDidMount () {
    this.props.dispatch(loadItem(this.props.uri));
    this.props.dispatch(loadItemActivity(this.props.uri));
    this.props.dispatch(loadVmSnapshots(this.props.uri));
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.virtualMachine) {
      document.title = nextProps.virtualMachine.name;
    }
    if (this.props.uri !== nextProps.uri) {
      // have to unload snapshots first!
      this.props.dispatch(unloadVmSnapshots());
      // unloadItem unloads activity

      // TODO: remove? will load function take care of unloading?
      // this.props.dispatch(unloadItem());

      this.props.dispatch(loadItem(nextProps.uri));
      this.props.dispatch(loadItemActivity(nextProps.uri));
      this.props.dispatch(loadVmSnapshots(nextProps.uri));
    }
  }

  componentWillUnmount () {
    // have to unload snapshots first!
    this.props.dispatch(unloadVmSnapshots());
    this.props.dispatch(unloadItem());
  }

  _onResponsive (responsive) {
    this.props.dispatch(vmResponsive(responsive));
  }

  _onToggleSidebar () {
    this.setState({
      showSidebarWhenSingle: ! this.state.showSidebarWhenSingle
    });
  }

  _renderActivity () {
    let { someActivity, moreActivity } = this.props;
    let result;
    if (someActivity) {
      let allActivity;
      if (moreActivity) {
        const query = `associatedResourceUri:${this.props.uri}`;
        const path = `/activity?q=${encodeURIComponent(query)}`;
        allActivity = (
          <Box pad="medium">
            <Anchor path={path}>All activity</Anchor>
          </Box>
        );
      }
      result = (
        <Section pad={{vertical: 'medium'}} full="horizontal">
          <Box pad={{horizontal: 'medium'}}>
            <Heading tag="h2">Activity</Heading>
          </Box>
          <VirtualMachineActivity uri={this.props.uri} />
          {allActivity}
        </Section>
      );
    }
    return result;
  }

  _renderSnapshots () {
    let { someSnapshots } = this.props;
    let result;
    if (someSnapshots) {
      result = (
        <Section pad={{vertical: 'medium'}} full="horizontal">
          <Box pad={{horizontal: 'medium'}}>
            <Heading tag="h2">Snapshots</Heading>
          </Box>
          <VirtualMachineSnapshots />
        </Section>
      );
    }
    return result;
  }

  _renderAddresses () {
    const { virtualMachine } = this.props;
    let addresses = [];
    virtualMachine.networks.forEach(network => {
      network.addresses.forEach(address => {
        addresses.push(
          <ListItem key={address}
            separator={addresses.length === 0 ? 'horizontal' : 'bottom'}>
            {address}
          </ListItem>
        );
      });
    });
    return (
      <Section pad={{vertical: 'medium'}} full="horizontal">
        <Box pad={{horizontal: 'medium'}}>
          <Heading tag="h2">IP Addresses</Heading>
        </Box>
        <List>
          {addresses}
        </List>
      </Section>
    );
  }

  render () {
    const { virtualMachine, nav, notifications, role, category } = this.props;

    let state;
    if (! notifications.alert && ! notifications.aggregate &&
      ! notifications.tasks) {
      state = (
        <Section full="horizontal" pad="none">
          <Notification pad="medium" status={virtualMachine.status}
            message={virtualMachine.state || ''} />
        </Section>
      );
    }
    let metrics, addresses;
    if ('Online' === virtualMachine.state) {
      metrics = (
        <VirtualMachineMetrics virtualMachine={virtualMachine}
          nav={nav} />
      );
      addresses = this._renderAddresses();
    }
    let activity = this._renderActivity();
    let snapshots = this._renderSnapshots();

    let sidebar;
    let sidebarControl;
    if ('read only' !== role) {
      let onSidebarClose;
      if ('single' === this.props.responsive) {
        sidebarControl = (
          <Button icon={<MoreIcon />} onClick={this._onToggleSidebar} />
        );
        onSidebarClose = this._onToggleSidebar;
      }
      sidebar = (
        <VirtualMachineActions category={category}
          virtualMachine={virtualMachine} onClose={onSidebarClose} />
      );
    }

    return (
      <Split flex="left" separator={true}
        priority={this.state.showSidebarWhenSingle ? 'right' : 'left'}
        onResponsive={this._onResponsive}>

        <div>
          <Header pad={{horizontal: "small", vertical: "medium"}}
            justify="between" size="large" colorIndex="light-2">
            <Box direction="row" align="center" pad={{between: 'small'}}
              responsive={false}>
              <Anchor icon={<LinkPreviousIcon />} path="/virtual-machines"
                a11yTitle="Return" />
              <Heading tag="h1" margin="none">
                <strong>{virtualMachine.name}</strong>
              </Heading>
            </Box>
            {sidebarControl}
          </Header>
          <Article pad="none" align="start" primary={true}>
            {state}
            <Notifications context={{uri: virtualMachine.uri}} />
            {metrics}
            {activity}
            {snapshots}
            {addresses}
          </Article>
        </div>

        {sidebar}
      </Split>
    );
  }
}

VirtualMachineShow.propTypes = {
  category: PropTypes.string.isRequired, /// remove?
  nav: PropTypes.object.isRequired,
  notifications: PropTypes.object,
  responsive: PropTypes.oneOf(['single', 'multiple']),
  role: PropTypes.string,
  uri: PropTypes.string.isRequired,
  virtualMachine: PropTypes.object
};

let select = (state, props) => {
  /// Why do we need this? Can't we hard code it?
  const category = state.route.location.pathname.split('/')[1];
  let someActivity = (state.item.activity && state.item.activity.total > 0);
  let moreActivity = (state.item.activity &&
    state.item.activity.total > state.item.activity.count);
  let someSnapshots = (state.vm.snapshots.total > 0);
  return {
    busy: state.notifications.busy,
    category: category,
    closePath: '/' + category + document.location.search,
    item: state.item,
    moreActivity: moreActivity,
    nav: state.nav,
    notifications: state.notifications,
    responsive: state.vm.responsive,
    role: state.session.role,
    someSnapshots: someSnapshots,
    someActivity: someActivity,
    uri: '/' + props.params.splat,
    virtualMachine: state.item.item || {},
    vm: state.vm
  };
};

export default connect(select)(VirtualMachineShow);
