// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
// import { migrateVm } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import FormField from 'grommet/components/FormField';
import Select from 'grommet/components/Select';

class VirtualMachineMigrate extends Component {

  constructor () {
    super();
    this._onSubmit = this._onSubmit.bind(this);
  }

  _onSubmit () {
    // this.props.dispatch(migrateVm(this.props.virtualMachine.uri));
    this.props.onClose();
  }

  render () {
    return (
      <LayerForm title="Migrate" submitLabel="Migrate"
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <fieldset>
          <FormField label="Host" htmlFor="host">
            <Select id="host" name="host"
              value=""
              options={this.props.hosts}
              onChange={this._onHostSelect}
              onSearch={this._onHostSearch} />
          </FormField>
        </fieldset>
      </LayerForm>
    );
  }
}

VirtualMachineMigrate.propTypes = {
  virtualMachine: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default connect()(VirtualMachineMigrate);;
