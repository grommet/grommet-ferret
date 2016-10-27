// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { powerOffVm } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import Paragraph from 'grommet/components/Paragraph';

class VirtualMachinePowerOff extends Component {

  constructor () {
    super();
    this._onSubmit = this._onSubmit.bind(this);
  }

  _onSubmit () {
    this.props.dispatch(powerOffVm(this.props.virtualMachine.uri));
    this.props.onClose();
  }

  render () {
    let virtualMachine = this.props.virtualMachine;
    return (
      <LayerForm title="Power Off" submitLabel="Yes, power off"
        compact={true}
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <fieldset>
          <Paragraph>Are you sure you want to power
            off <strong>{virtualMachine.name}</strong>?</Paragraph>
        </fieldset>
      </LayerForm>
    );
  }
}

VirtualMachinePowerOff.propTypes = {
  virtualMachine: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default connect()(VirtualMachinePowerOff);;
