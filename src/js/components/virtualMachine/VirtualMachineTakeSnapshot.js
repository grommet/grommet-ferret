// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
// import { takeVmSnapshot } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import FormField from 'grommet/components/FormField';

class VirtualMachineTakeSnapshot extends Component {

  constructor () {
    super();
    this._onSubmit = this._onSubmit.bind(this);
  }

  _onSubmit () {
    // this.props.dispatch(takeVmSnapshot(this.props.virtualMachine.uri));
    this.props.onClose();
  }

  render () {
    return (
      <LayerForm title="Take Snapshot" submitLabel="Take Snapshot"
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <fieldset>
          <FormField label="Name" htmlFor="name">
            <input id="name" name={"name"} type="text"
              defaultValue="" />
          </FormField>
        </fieldset>
      </LayerForm>
    );
  }
}

VirtualMachineTakeSnapshot.propTypes = {
  virtualMachine: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default connect()(VirtualMachineTakeSnapshot);;
