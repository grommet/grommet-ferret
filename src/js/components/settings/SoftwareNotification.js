// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { deleteSoftware } from '../../actions/actions';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import Notification from 'grommet/components/Notification';
import Paragraph from 'grommet/components/Paragraph';
import TrashIcon from 'grommet/components/icons/base/Trash';
import UpdateIcon from 'grommet/components/icons/base/Update';
import UploadIcon from 'grommet/components/icons/base/Upload';

class SoftwareNotification extends Component {

  constructor () {
    super();
    this._onDelete = this._onDelete.bind(this);
  }

  _onDelete () {
    this.props.dispatch(deleteSoftware());
  }

  render () {
    const { productName, role, software, onAction } = this.props;

    let menu, details;

    if ('ok' === software.status) {
      details = (
        <Paragraph>This {productName} is now ready to be updated
          to <Anchor path="/settings/update">
            version {software.version}
          </Anchor>.
        </Paragraph>
      );
    } else if (software.errors) {
      const errors = software.errors.map((error, index) => (
        <Paragraph key={index}>{error.message}</Paragraph>
      ));
      details = <div>{errors}</div>;
    }

    if (software.action && 'read only' !== role) {
      let label, icon;
      if ('update' === software.action) {
        label = 'Update';
        icon = <UpdateIcon />;
      } else if ('upload' === software.action) {
        label = 'Upload';
        icon = <UploadIcon />;
      }
      menu = (
        <Menu inline={true} direction="row" justify="between"
          responsive={false}>
          <Anchor href="#" icon={icon}
            a11yTitle={`${label} version ${software.version} software`}
            onClick={() => {
              onAction(software.action);
            }}>
            {label} software
          </Anchor>
          <Anchor href="#" icon={<TrashIcon />} onClick={this._onDelete}
            a11yTitle={`Remove version ${software.version} software`} />
        </Menu>
      );
    }

    return (
      <Notification key="software" pad="medium" status={software.status}
        message={software.message}
        state={software.state}
        percentComplete={software.percent}>
        {details}
        {menu}
      </Notification>
    );
  }
};

SoftwareNotification.propTypes = {
  onAction: PropTypes.func.isRequired,
  productName: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  software: PropTypes.shape({
    errors: PropTypes.array,
    message: PropTypes.string,
    status: PropTypes.string,
    version: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired
};

let select = (state) => ({
  productName: state.settings.productName.short,
  role: state.session.role,
  software: state.software
});

export default connect(select)(SoftwareNotification);
