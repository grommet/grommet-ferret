// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { checkSupportDump, deleteSupportDump } from '../../actions/actions';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import Notification from 'grommet/components/Notification';
import Paragraph from 'grommet/components/Paragraph';
import DownloadIcon from 'grommet/components/icons/base/Download';
import TrashIcon from 'grommet/components/icons/base/Trash';
import SpinningIcon from 'grommet/components/icons/Spinning';

class SupportDumpNotification extends Component {

  constructor () {
    super();
    this._onDelete = this._onDelete.bind(this);
    this._onDownload = this._onDownload.bind(this);
    this.state = {};
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.downloading) {
      if (nextProps.support.valid) {
        window.open(nextProps.support.file, "download");
      }
      this.setState({ downloading: undefined });
    }
  }

  // This is for the prototype only
  componentWillUnmount () {
    if (false === this.props.support.valid) {
      this.props.dispatch(deleteSupportDump());
    }
  }

  _onDownload (event) {
    event.preventDefault();
    this.setState({ downloading: true });
    this.props.dispatch(checkSupportDump(this.props.support.file));
  }

  _onDelete () {
    this.props.dispatch(deleteSupportDump());
  }

  render () {
    const { support, role } = this.props;

    let status, message, details, control;
    if (support.creating) {
      status = 'unknown';
      message = 'Creating support dump';
      details = 'This can take a while. You will be able to download it when' +
        'it is ready.';
      control = <SpinningIcon />;
    } else if (false !== support.valid) {
      status = 'ok';
      message = 'Support dump created';
      details = 'Download it and provide it to your authorized support' +
       'representative.';
      let removeControl;
      if ('read only' !== role) {
        removeControl = (
          <Anchor href="#" icon={<TrashIcon />} onClick={this._onDelete}
            a11yTitle="Remove support dump file" />
        );
      }
      control = (
        <Menu inline={true} direction="row" justify="between"
          responsive={false}>
          <Anchor href={support.file} icon={<DownloadIcon />} target="download"
            a11yTitle="Download support dump file" onClick={this._onDownload}>
            Download
          </Anchor>
          {removeControl}
        </Menu>
      );
    } else {
      status = 'disabled';
      message = 'Support dump outdated';
      details = 'The previously generated support dump has been superseded ' +
        'by a subsequent one.';
    }

    return (
      <Notification key="support" pad="medium" status={status}
        message={message}>
        <Paragraph>{details}</Paragraph>
        {control}
      </Notification>
    );
  }
};

SupportDumpNotification.propTypes = {
  role: PropTypes.string.isRequired,
  support: PropTypes.shape({
    creating: PropTypes.bool,
    file: PropTypes.string
  }).isRequired
};

let select = (state) => ({
  role: state.session.role,
  support: state.support
});

export default connect(select)(SupportDumpNotification);
