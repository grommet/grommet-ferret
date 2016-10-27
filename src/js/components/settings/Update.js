// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { updateSoftware } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import Box from 'grommet/components/Box';
import Paragraph from 'grommet/components/Paragraph';
import FormField from 'grommet/components/FormField';
import CheckBox from 'grommet/components/CheckBox';
import Anchor from 'grommet/components/Anchor';

class Update extends Component {

  constructor () {
    super();
    this._onSubmit = this._onSubmit.bind(this);
    this._onChange = this._onChange.bind(this);

    this.state = {
      accepted: false,
      errors: {}
    };
  }

  _onSubmit () {
    let errors = {};
    let noErrors = true;
    if (! this.state.accepted) {
      errors.accepted = 'required';
      noErrors = false;
    }
    if (noErrors) {
      this.props.dispatch(updateSoftware());
      this.props.onClose();
    } else {
      this.setState({ errors: errors });
    }
  }

  _onChange (event) {
    this.setState({ accepted: ! this.state.accepted, errors: {} });
  }

  render () {
    const { productName, software } = this.props;

    return (
      <LayerForm title="Update Software" submitLabel="Update"
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <Paragraph>Update
            this {productName} to <Anchor path="/settings/update">
            version {software.version}
          </Anchor>.
        </Paragraph>
        <Paragraph>If this is a major version update,
        virtual machine vending may be temporarily unavailable.
        </Paragraph>
        <fieldset>
          <FormField htmlFor="accept" error={this.state.errors.accepted}>
            <Box pad={{horizontal: 'medium'}}>
              <Anchor href={software.eula} target="notes">
                end user license agrement
              </Anchor>
            </Box>
            <CheckBox id="accept" name="accept"
              label="I agree to the terms of the license agreement"
              checked={this.state.accept} onChange={this._onChange} />
          </FormField>
        </fieldset>
      </LayerForm>
    );
  }
}

Update.propTypes = {
  onClose: PropTypes.func,
  productName: PropTypes.string,
  update: PropTypes.object
};

let select = (state) => ({
  productName: state.settings.productName.short,
  software: state.software
});

export default connect(select)(Update);
