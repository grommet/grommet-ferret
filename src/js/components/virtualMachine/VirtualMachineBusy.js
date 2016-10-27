// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';
import LayerForm from 'grommet-templates/components/LayerForm';
import Paragraph from 'grommet/components/Paragraph';

const VirtualMachineBusy = (props) => {

  const { virtualMachine, onClose } = props;
  return (
    <LayerForm title="Busy" submitLabel="OK"
      compact={true} onClose={onClose} onSubmit={onClose}>
      <fieldset>
        <Paragraph><strong>{virtualMachine.name}</strong> is currently busy. You
          can try again when it isn't.</Paragraph>
      </fieldset>
    </LayerForm>
  );
};

VirtualMachineBusy.propTypes = {
  virtualMachine: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default VirtualMachineBusy;
