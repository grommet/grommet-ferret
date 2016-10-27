// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { uploadSoftware } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import FormField from 'grommet/components/FormField';
import Paragraph from 'grommet/components/Paragraph';
import Anchor from 'grommet/components/Anchor';

class Upload extends Component {

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
      this.props.dispatch(uploadSoftware(file));
      this.props.onClose();
    } else {
      this.setState({ errors: errors });
    }
  }

  render () {
    const { productName } = this.props;

    const downloadURL = (
      "http://grommet.io/ferret/software"
    );
    return (
      <LayerForm title="Upload Software" submitLabel="Upload"
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <Paragraph>The <Anchor
          href={downloadURL}>latest {productName} software
          update images</Anchor> can be downloaded for use here.</Paragraph>
        <Paragraph>Updating the {productName} software is a two step
          process. First, upload a software bundle to make it
          available. Then, update the running {productName} software.
        </Paragraph>
        <Paragraph>You must keep your browser window open for the duration
          of the upload.</Paragraph>
        <fieldset>
          <FormField label="File" htmlFor="file" error={this.state.errors.file}>
            <input ref="file" id="file" name="file" type="file" />
          </FormField>
        </fieldset>
      </LayerForm>
    );
  }
}

Upload.propTypes = {
  onClose: PropTypes.func,
  productName: PropTypes.string
};

let select = (state) => ({
  productName: state.settings.productName.short
});

export default connect(select)(Upload);
