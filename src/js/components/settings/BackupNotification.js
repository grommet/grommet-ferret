// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { checkBackup, deleteBackup } from '../../actions/actions';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import Notification from 'grommet/components/Notification';
import Paragraph from 'grommet/components/Paragraph';
import DownloadIcon from 'grommet/components/icons/base/Download';
import TrashIcon from 'grommet/components/icons/base/Trash';

class BackupNotification extends Component {

  constructor () {
    super();
    this._onDelete = this._onDelete.bind(this);
    this._onDownload = this._onDownload.bind(this);
    this.state = {};
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.downloading) {
      if (nextProps.backup.valid) {
        window.open(nextProps.backup.file, "download");
      }
      this.setState({ downloading: undefined });
    }
  }

  // This is for the prototype only
  componentWillUnmount () {
    if (false === this.props.backup.valid) {
      this.props.dispatch(deleteBackup());
    }
  }

  _onDownload (event) {
    event.preventDefault();
    this.setState({ downloading: true });
    this.props.dispatch(checkBackup(this.props.backup.file));
  }

  _onDelete () {
    this.props.dispatch(deleteBackup());
  }

  render () {
    const { backup, role } = this.props;

    let status, message, details, control;
    if (false !== backup.valid) {
      status = 'ok';
      message = 'Backup created';
      details = 'Download it and keep it somewhere safe.';
      let removeControl;
      if ('read only' !== role) {
        removeControl = (
          <Anchor href="#" icon={<TrashIcon />} onClick={this._onDelete}
            a11yTitle="Remove backup file" />
        );
      }
      control = (
        <Menu inline={true} direction="row" justify="between"
          responsive={false}>
          <Anchor href={backup.file} icon={<DownloadIcon />} target="download"
            a11yTitle="Download backup file" onClick={this._onDownload}>
            Download
          </Anchor>
          {removeControl}
        </Menu>
      );
    } else {
      status = 'disabled';
      message = 'Backup outdated';
      details = 'The previously generated backup has been superseded ' +
        'by a subsequent one.';
    }

    return (
      <Notification key="backup" pad="medium" status={status}
        message={message}>
        <Paragraph>{details}</Paragraph>
        {control}
      </Notification>
    );
  }
};

BackupNotification.propTypes = {
  role: PropTypes.string.isRequired,
  backup: PropTypes.shape({
    file: PropTypes.string
  }).isRequired
};

let select = (state) => ({
  role: state.session.role,
  backup: state.backup
});

export default connect(select)(BackupNotification);
