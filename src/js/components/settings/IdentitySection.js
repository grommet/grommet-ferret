// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import Button from 'grommet/components/Button';
import EditIcon from 'grommet/components/icons/base/Edit';
import SettingsListItem from './SettingsListItem';
import SectionErrors from './SectionErrors';

const IdentitySection = (props) => {

  const { productName, role, settings, onOpen } = props;
  let control;
  if ('read only' !== role) {
    control = (
      <Button icon={<EditIcon />} onClick={onOpen}
        a11yTitle='Edit Identity' />
    );
  }
  let details;
  if (settings.errors && settings.errors.network) {
    details = (
      <SectionErrors errors={settings.errors.network} section="identity" />
    );
  } else {
    details = (
      <span>
        This {productName} is called <strong>{settings.name}</strong> and is
        on the network at <strong>{settings.network.ipV4Address}</strong>.
      </span>
    );
  }
  return (
    <SettingsListItem key="identity" control={control} first={true}>
      <strong>Identity</strong>
      {details}
    </SettingsListItem>
  );
};

IdentitySection.propTypes = {
  onOpen: PropTypes.func.isRequired,
  productName: PropTypes.string.isRequired,
  role: PropTypes.string,
  settings: PropTypes.shape({
    name: PropTypes.string,
    network: PropTypes.object.isRequired,
    errors: PropTypes.object
  }).isRequired
};

export default IdentitySection;
