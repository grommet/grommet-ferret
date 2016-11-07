// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadSettings, updateSettings, settingsResponsive,
  loadBackup, createBackup, loadSoftware // loadSupport
  } from '../../actions/actions';
import { navEnable, navActivate } from '../../actions/nav';
import Split from 'grommet/components/Split';
import Article from 'grommet/components/Article';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import Box from 'grommet/components/Box';
import Header from 'grommet/components/Header';
import Footer from 'grommet/components/Footer';
import Title from 'grommet/components/Title';
import Anchor from 'grommet/components/Anchor';
import Button from 'grommet/components/Button';
import MoreIcon from 'grommet/components/icons/base/More';
import SettingsActions from './SettingsActions';
import IdentitySection from './IdentitySection';
import HypervisorSection from './HypervisorSection';
import DirectorySection from './DirectorySection';
import NodesSection from './NodesSection';
import SoftwareNotification from './SoftwareNotification';
import BackupNotification from './BackupNotification';
import SupportDumpNotification from './SupportDumpNotification';
import NavControl from '../NavControl';
import Notifications from '../Notifications';
import IdentityEdit from './IdentityEdit';
import HypervisorEdit from './HypervisorEdit';
import DirectoryEdit from './DirectoryEdit';
import AccountEdit from './AccountEdit';
import NodesEdit from './NodesEdit';
import SessionMenu from '../SessionMenu';
import CreateSupportDump from './CreateSupportDump';
import Restart from './Restart';
import Restore from './Restore';
import Upload from './Upload';
import Update from './Update';

const LAYERS = {
  accountEdit: AccountEdit,
  identityEdit: IdentityEdit,
  hypervisorEdit: HypervisorEdit,
  directoryEdit: DirectoryEdit,
  nodesEdit: NodesEdit,
  restart: Restart,
  restore: Restore,
  upload: Upload,
  update: Update,
  createSupportDump: CreateSupportDump
};

class SettingsEdit extends Component {

  constructor (props) {
    super(props);

    this._onResponsive = this._onResponsive.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onClickLogo = this._onClickLogo.bind(this);
    this._onLayerOpen = this._onLayerOpen.bind(this);
    this._onLayerClose = this._onLayerClose.bind(this);
    this._onClickTitle = this._onClickTitle.bind(this);
    this._onToggleSidebar = this._onToggleSidebar.bind(this);
    this._onBackup = this._onBackup.bind(this);

    this._setDocumentTitle(props);
    this.state = {
      layer: null,
      errors: {}
    };
  }

  componentDidMount () {
    this.props.dispatch(loadSettings());
    this.props.dispatch(loadSoftware());
    this.props.dispatch(loadBackup());
    // Since we are simulating the Atlas support dump process, we need to
    // leave the support state alone here.
    // this.props.dispatch(loadSupport());
    this.props.dispatch(navEnable('done' === this.props.settings.state));
  }

  componentWillReceiveProps (nextProps) {
    this._setDocumentTitle(nextProps);
  }

  componentWillUnmount () {
    this.props.dispatch(navEnable(true));
  }

  _setDocumentTitle (props) {
    document.title = `Settings - ${props.instanceName || ''}`;
  }

  _onSubmit (event) {
    event.preventDefault();
    this.props.dispatch(updateSettings(this.props.settings));
  }

  _onResponsive (responsive) {
    this.props.dispatch(settingsResponsive(responsive));
  }

  _onLayerOpen (name) {
    this.setState({ layer: name, showSidebarWhenSingle: false });
  }

  _onLayerClose (nextLayer=null) {
    if (nextLayer && typeof nextLayer !== 'string') {
      nextLayer = null;
    }
    this.setState({ layer: nextLayer });
  }

  _onClickTitle () {
    this.props.dispatch(navActivate(true));
  }

  _onClickLogo() {
    this.props.dispatch(navActivate(true));
  }

  _onToggleSidebar () {
    this.setState({
      showSidebarWhenSingle: ! this.state.showSidebarWhenSingle
    });
  }

  _onBackup () {
    this.setState({ showSidebarWhenSingle: false });
    this.props.dispatch(createBackup());
  }

  _renderNotifications () {
    const { software, backup, support } = this.props;
    let result = [
      <Notifications key="notifications" context={{uri: '/rest/appliances/1'}}
        preservePriorRunningTasks={false} />
    ];
    if (software.status && ! software.runningTaskUri) {
      result.push(
        <SoftwareNotification key="software"
          onAction={this._onLayerOpen.bind(this)} />
      );
    }
    if (backup.file) {
      result.push(
        <BackupNotification key="backup" />
      );
    }
    if (support.creating || support.file) {
      result.push(
        <SupportDumpNotification key="suport" />
      );
    }
    return result;
  }

  _renderLayer () {
    let layer;
    if (this.state.layer) {
      const Layer = LAYERS[this.state.layer];
      layer = <Layer onClose={this._onLayerClose} />;
    }
    return layer;
  }

  render () {
    const { settings, setup, productName, role } = this.props;

    let sessionMenu;
    if (setup) {
      sessionMenu = <SessionMenu dropAlign={{right: 'right'}} />;
    }

    let sidebar, sidebarControl;
    if ('read only' !== role && ! this.props.setup) {
      sidebar = (
        <SettingsActions onClose={this._onToggleSidebar}
          onAction={this._onLayerOpen} />
      );

      if ('single' === this.props.responsive) {
        sidebarControl = (
          <Button icon={<MoreIcon />} onClick={this._onToggleSidebar} />
        );
      }
    }

    let notifications;
    if (! setup) {
      notifications = this._renderNotifications();
    }

    let submit;
    if ('read only' !== role) {
      submit = (
        <ListItem separator={null} responsive={false}>
          <Box pad={{vertical: 'medium'}}>
            <Button primary={true} type="submit" label="Submit"
              onClick={this._onSubmit} />
          </Box>
        </ListItem>
      );
    }

    let setupAction;
    if (this.props.setup) {
      setupAction = (
        <Anchor href="#" onClick={this._onLayerOpen.bind(this, 'restore')}>
          Restore from backup
        </Anchor>
      );
    }

    let layer = this._renderLayer();

    return (
      <Split flex="left" separator={true}
        priority={this.state.showSidebarWhenSingle ? 'right' : 'left'}
        onResponsive={this._onResponsive}>

        <Article full="vertical" primary={!setup}>
          <Header size="large" justify="between" pad={{horizontal: 'medium'}}>
            <Title responsive={false}>
              <NavControl />
              <span>Settings</span>
            </Title>
            <span>
              {sessionMenu}
              {sidebarControl}
            </span>
          </Header>

          {notifications}

          <Box flex={true}>
            <List>
              <IdentitySection productName={productName} role={role}
                settings={settings}
                onOpen={this._onLayerOpen.bind(this, 'identityEdit')} />
              <HypervisorSection productName={productName} role={role}
                settings={settings}
                onOpen={this._onLayerOpen.bind(this, 'hypervisorEdit')} />
              <DirectorySection productName={productName} role={role}
                settings={settings}
                onOpen={this._onLayerOpen.bind(this, 'directoryEdit')} />
              <NodesSection productName={productName} role={role}
                settings={settings}
                onOpen={this._onLayerOpen.bind(this, 'nodesEdit')} />
              {submit}
            </List>
          </Box>

          <Footer pad="medium" justify="between">
            <Anchor path="/settings/software">
              {productName} version {settings.version}
            </Anchor>
            {setupAction}
          </Footer>

          {layer}
        </Article>

        {sidebar}
      </Split>
    );
  }
}

SettingsEdit.propTypes = {
  instanceName: PropTypes.string,
  item: PropTypes.object,
  productName: PropTypes.string,
  role: PropTypes.string,
  settings: PropTypes.shape({
    name: PropTypes.string,
    network: PropTypes.object.isRequired,
    dataCenter: PropTypes.string,
    directory: PropTypes.object,
    hypervisor: PropTypes.object,
    errors: PropTypes.object
  }),
  setup: PropTypes.bool,
  state: PropTypes.string
};

let select = (state) => ({
  backup: state.backup,
  instanceName: state.settings.settings.name,
  item: state.item,
  nav: state.nav,
  productName: state.settings.productName.short,
  responsive: state.settings.responsive,
  role: state.session.role,
  state: state.settings.state,
  settings: state.settings.settings,
  setup: (state.settings.settings.state &&
    'done' !== state.settings.settings.state),
  support: state.support,
  software: state.software
});

export default connect(select)(SettingsEdit);
