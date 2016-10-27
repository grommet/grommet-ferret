// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { createBackup } from '../../actions/actions';
import Box from 'grommet/components/Box';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Menu from 'grommet/components/Menu';
import Button from 'grommet/components/Button';
import SkipLinkAnchor from 'grommet/components/SkipLinkAnchor';
import ArchiveIcon from 'grommet/components/icons/base/Archive';
import CloseIcon from 'grommet/components/icons/base/Close';
import PowerIcon from 'grommet/components/icons/base/Power';
import SupportIcon from 'grommet/components/icons/base/Support';
import SyncIcon from 'grommet/components/icons/base/Sync';
import UploadIcon from 'grommet/components/icons/base/Upload';

class SettingsActions extends Component {

  constructor () {
    super();
    this._onBackup = this._onBackup.bind(this);
    this._onAction = this._onAction.bind(this);
  }

  _onBackup () {
    this.props.dispatch(createBackup());
    this.props.onClose();
  }

  _onAction (action) {
    this.props.onAction(action);
  }

  render () {
    const { responsive, onClose } = this.props;
    let name, closeControl;
    if ('single' === responsive) {
      name = <Heading tag="h3">Settings</Heading>;
      closeControl = (
        <Button icon={<CloseIcon />} onClick={onClose}
          a11yTitle='Close settings actions' />
      );
    }

    return (
      <Sidebar size="medium" colorIndex="light-2">
        <SkipLinkAnchor label="Right Panel" />
        <Header pad={{horizontal: 'medium', vertical: 'medium'}}
          justify="between" size="large" >
          {name}
          {closeControl}
        </Header>
        <Box pad="medium">
          <Menu>
            <Button align="start" plain={true}
              icon={<UploadIcon />} label="Update software"
              onClick={this._onAction.bind(this, 'upload')} />
            <Button align="start" plain={true}
              icon={<ArchiveIcon />} label="Backup"
              onClick={this._onBackup} />
            <Button align="start" plain={true}
              icon={<SyncIcon />} label="Restore from backup"
              onClick={this._onAction.bind(this, 'restore')} />
            <Button align="start" plain={true}
              icon={<SupportIcon />} label="Create support dump"
              onClick={this._onAction.bind(this, 'createSupportDump')} />
            <Button align="start" plain={true}
              icon={<PowerIcon />} label="Restart"
              onClick={this._onAction.bind(this, 'restart')} />
          </Menu>
        </Box>
      </Sidebar>
    );
  }
}

SettingsActions.propTypes = {
  onAction: PropTypes.func,
  onClose: PropTypes.func,
  responsive: PropTypes.string
};

let select = (state) => ({
  responsive: state.settings.responsive
});

export default connect(select)(SettingsActions);
