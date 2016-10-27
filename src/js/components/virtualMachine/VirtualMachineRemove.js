// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { removeItem } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import Paragraph from 'grommet/components/Paragraph';

class VirtualMachineRemove extends Component {

  constructor () {
    super();
    this._onRemove = this._onRemove.bind(this);
  }

  _onRemove () {
    this.props.dispatch(removeItem(this.props.virtualMachine.category,
      this.props.virtualMachine.uri, false));
    this.props.onClose();
  }

  render () {
    let virtualMachine = this.props.virtualMachine;
    return (
      <LayerForm title="Remove" submitLabel="Yes, remove"
        compact={true}
        onClose={this.props.onClose} onSubmit={this._onRemove}>
        <fieldset>
          <Paragraph>Are you sure you want to
            remove <strong>{virtualMachine.name}</strong>?</Paragraph>
        </fieldset>
      </LayerForm>
    );
  }
}

VirtualMachineRemove.propTypes = {
  virtualMachine: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default connect()(VirtualMachineRemove);;
