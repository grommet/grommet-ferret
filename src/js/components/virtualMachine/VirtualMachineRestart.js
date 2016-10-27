// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { restartVm } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import Paragraph from 'grommet/components/Paragraph';

class VirtualMachineRestart extends Component {

  constructor () {
    super();
    this._onSubmit = this._onSubmit.bind(this);
  }

  _onSubmit () {
    this.props.dispatch(restartVm(this.props.virtualMachine.uri));
    this.props.onClose();
  }

  render () {
    let virtualMachine = this.props.virtualMachine;
    return (
      <LayerForm title="Restart" submitLabel="Yes, restart"
        compact={true}
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <fieldset>
          <Paragraph>Are you sure you want to
            restart <strong>{virtualMachine.name}</strong>?</Paragraph>
        </fieldset>
      </LayerForm>
    );
  }
}

VirtualMachineRestart.propTypes = {
  virtualMachine: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default connect()(VirtualMachineRestart);;
