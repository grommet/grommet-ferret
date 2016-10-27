// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
// import { cloneVm } from '../../actions/vm';
import LayerForm from 'grommet-templates/components/LayerForm';
import FormField from 'grommet/components/FormField';

class VirtualMachineClone extends Component {

  constructor () {
    super();
    this._onSubmit = this._onSubmit.bind(this);
  }

  _onSubmit () {
    // this.props.dispatch(cloneVm(this.props.virtualMachine.uri));
    this.props.onClose();
  }

  render () {
    let virtualMachine = this.props.virtualMachine;
    return (
      <LayerForm title="Clone" submitLabel="Clone"
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <fieldset>
          <FormField label="Name" htmlFor="name">
            <input id="name" name={"name"} type="text"
              defaultValue={virtualMachine.name + ' clone'} />
          </FormField>
        </fieldset>
      </LayerForm>
    );
  }
}

VirtualMachineClone.propTypes = {
  virtualMachine: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default connect()(VirtualMachineClone);;
