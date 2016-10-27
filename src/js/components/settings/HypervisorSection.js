// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import Button from 'grommet/components/Button';
import EditIcon from 'grommet/components/icons/base/Edit';
import SettingsListItem from './SettingsListItem';
import SectionErrors from './SectionErrors';

const HypervisorSection = (props) => {

  const { productName, role, settings, onOpen } = props;
  const hypervisor = settings.hypervisor || {};
  let contents;
  if (settings.errors && settings.errors.hypervisor) {
    contents = (
      <SectionErrors errors={settings.errors.hypervisor} section="hypervisor" />
    );
  }
  let control;
  if (hypervisor.address && hypervisor.userName) {
    if ('read only' !== role) {
      control = (
        <Button icon={<EditIcon />} onClick={onOpen} a11yTitle='Edit vCenter' />
      );
    }
    if (! contents) {
      contents = (
        <span>
          This {productName} accesses the vCenter
          at <strong>{hypervisor.address}</strong> as
          user <strong>{hypervisor.userName}</strong>.
        </span>
      );
    }
  } else {
    if ('read only' !== role) {
      control = (
        <Button label="Connect" onClick={onOpen} a11yTitle='Connect vCenter' />
      );
    }
    if (! contents) {
      contents = (
        <span>
          This {productName} requires credentials to access the vCenter
          at <strong>{hypervisor.address}</strong>.
        </span>
      );
    }
  }
  return (
    <SettingsListItem key="hypervisor" control={control}>
      <strong>vCenter</strong>
      {contents}
    </SettingsListItem>
  );
};

HypervisorSection.propTypes = {
  onOpen: PropTypes.func.isRequired,
  productName: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  settings: PropTypes.shape({
    hypervisor: PropTypes.object,
    errors: PropTypes.object
  }).isRequired
};

export default HypervisorSection;
