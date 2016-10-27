// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { restoreSettings } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import FormField from 'grommet/components/FormField';
import Paragraph from 'grommet/components/Paragraph';

class Restore extends Component {

  constructor () {
    super();
    this._onSubmit = this._onSubmit.bind(this);

    this.state = {
      errors: {}
    };
  }

  _onSubmit () {
    let errors = {};
    let noErrors = true;
    let file = this.refs.file.files[0];
    if (! file) {
      errors.file = 'required';
      noErrors = false;
    }
    if (noErrors) {
      this.props.dispatch(restoreSettings(file));
    } else {
      this.setState({ errors: errors });
    }
  }

  render () {
    const { productName } = this.props;
    return (
      <LayerForm title="Restore From Backup" submitLabel="Upload and Restore"
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <Paragraph>
          Restoring {productName} will replace all configuration
          settings.
        </Paragraph>
        <fieldset>
          <FormField label="Backup file" htmlFor="file"
            error={this.state.errors.file}>
            <input ref="file" id="file" name="file" type="file" />
          </FormField>
        </fieldset>
      </LayerForm>
    );
  }
}

Restore.propTypes = {
  onClose: PropTypes.func,
  productName: PropTypes.string
};

let select = (state) => ({
  productName: state.settings.productName.short
});

export default connect(select)(Restore);
