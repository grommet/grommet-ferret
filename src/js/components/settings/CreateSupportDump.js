// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { createSupportDump } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import Paragraph from 'grommet/components/Paragraph';
import FormField from 'grommet/components/FormField';
import CheckBox from 'grommet/components/CheckBox';

class CreateSupportDump extends Component {

  constructor (props) {
    super(props);

    this._onSubmit = this._onSubmit.bind(this);
    this._onToggleEncrypt = this._onToggleEncrypt.bind(this);

    this.state = {
      encrypt: true
    };
  }

  _onSubmit () {
    this.props.dispatch(createSupportDump(this.state.encrypt));
    this.props.onClose();
  }

  _onToggleEncrypt (event) {
    this.setState({ encrypt: ! this.state.encrypt });
  }

  render () {
    const { encrypt } = this.state;
    return (
      <LayerForm title="Create Support Dump" submitLabel="OK"
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <Paragraph>It will take a few minutes to package things up.
          Once the packaging has finished, you can download it
          and send it off.</Paragraph>
        <fieldset>
          <FormField htmlFor="encrypt">
            <CheckBox id="encrypt" name="encrypt" type="text"
              label="Encrypt support dump?"
              checked={encrypt} onChange={this._onToggleEncrypt} />
          </FormField>
        </fieldset>
      </LayerForm>
    );
  }
}

CreateSupportDump.propTypes = {
  onClose: PropTypes.func
};

export default connect()(CreateSupportDump);
