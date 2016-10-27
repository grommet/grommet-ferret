// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import Button from 'grommet/components/Button';
import EditIcon from 'grommet/components/icons/base/Edit';
import SettingsListItem from './SettingsListItem';
import SectionErrors from './SectionErrors';

const DirectorySection = (props) => {

  const { productName, role, settings, onOpen } = props;
  const directory = settings.directory || {};
  let contents;
  if (settings.errors && settings.errors.directory) {
    contents = (
      <SectionErrors errors={settings.errors.directory} section="directory" />
    );
  }
  let control;
  if (directory.address) {
    let groups;
    if (directory.groups.length > 0) {
      let names = [];
      directory.groups.forEach((group, index) => {
        if (index > 0) {
          let separator;
          if (index === directory.groups.length - 1) {
            separator = ", and ";
          } else {
            separator = ", ";
          }
          names.push(<span key={index}>{separator}</span>);
        }
        names.push(<strong key={group.cn + index}>{group.cn}</strong>);
      });
      groups = (
        <span>for the {names} {names.length > 1 ? 'groups' : 'group'}</span>
      );
    }
    if ('read only' !== role) {
      control = (
        <Button icon={<EditIcon />} onClick={onOpen}
          a11yTitle='Edit Directory' />
      );
    }
    if (! contents) {
      contents = (
        <span>
          This {productName} uses the directory
          at <strong>{directory.address}</strong> {groups}.
        </span>
      );
    }
  } else {
    if ('read only' !== role) {
      control = (
        <Button key="action" label="Connect" onClick={onOpen}
          a11yTitle='Connect Directory' />
      );
    }
    if (! contents) {
      contents = (
        <span>
          This {productName} is not connected to an LDAP or ActiveDirectory yet.
        </span>
      );
    }
  }
  return (
    <SettingsListItem key="directory" control={control}>
      <strong>Directory</strong>
      {contents}
    </SettingsListItem>
  );
};

DirectorySection.propTypes = {
  onOpen: PropTypes.func.isRequired,
  productName: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  settings: PropTypes.shape({
    directory: PropTypes.object,
    errors: PropTypes.object
  }).isRequired
};

export default DirectorySection;
