// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import Button from 'grommet/components/Button';
import EditIcon from 'grommet/components/icons/base/Edit';
import SettingsListItem from './SettingsListItem';
import SectionErrors from './SectionErrors';

const NodesSection = (props) => {

  const { productName, role, settings, onOpen } = props;
  const nodes = settings.nodes || [];
  let contents;
  if (settings.errors && settings.errors.nodes) {
    contents = (
      <SectionErrors errors={settings.errors.nodes} section="nodes" />
    );
  }
  let control;
  const unconfiguredNodes = nodes.filter((node) => {
    return (! node.address);
  });
  if (unconfiguredNodes.length === 0) {
    if ('read only' !== role) {
      control = (
        <Button icon={<EditIcon />} onClick={onOpen} a11yTitle='Edit Nodes' />
      );
    }
    if (! contents) {
      contents = (
        <span>
          This {productName}
          has <strong>{nodes.length}
          </strong> {nodes.length > 1 ? 'nodes' : 'node'}.
        </span>
      );
    }
  } else {
    if ('read only' !== role) {
      control = (
        <Button label="Setup" onClick={onOpen} a11yTitle='Setup Nodes' />
      );
    }
    if (! contents) {
      contents = (
        <span>
          This {productName} has {unconfiguredNodes.length} nodes that need
          to be setup.
        </span>
      );
    }
  }
  return (
    <SettingsListItem key="nodes" control={control}>
      <strong>Nodes</strong>
      {contents}
    </SettingsListItem>
  );
};

NodesSection.propTypes = {
  onOpen: PropTypes.func.isRequired,
  productName: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  settings: PropTypes.shape({
    nodes: PropTypes.array,
    errors: PropTypes.object
  }).isRequired
};

export default NodesSection;
