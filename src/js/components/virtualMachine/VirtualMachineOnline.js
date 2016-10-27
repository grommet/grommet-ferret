// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import LayerForm from 'grommet-templates/components/LayerForm';
import Paragraph from 'grommet/components/Paragraph';

const VirtualMachineOnline = (props) => {

  const { virtualMachine, onClose } = props;
  return (
    <LayerForm title="Online" submitLabel="OK"
      compact={true} onClose={onClose} onSubmit={onClose}>
      <fieldset>
        <Paragraph><strong>{virtualMachine.name}</strong> is currently online
          and cannot be changed. Power it off in order to make changes to it.
        </Paragraph>
      </fieldset>
    </LayerForm>
  );
};

VirtualMachineOnline.propTypes = {
  virtualMachine: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default VirtualMachineOnline;
