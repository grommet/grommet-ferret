// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { connect } from 'react-redux';
import LayerForm from 'grommet-templates/components/LayerForm';
import FormField from 'grommet/components/FormField';
import Paragraph from 'grommet/components/Paragraph';

class AccountEdit extends Component {

  constructor (props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
    this._onChange = this._onChange.bind(this);

    this.state = {
      errors: {},
      values: {}
    };
  }

  _onSubmit (event) {
    event.preventDefault();
    const { values } = this.state;
    let errors = {};
    let noErrors = true;
    if (! values.currentPassword) {
      errors.currentPassword = 'required';
      noErrors = false;
    }
    if (! values.newPassword) {
      errors.newPassword = 'required';
      noErrors = false;
    }
    if (noErrors) {
      this.props.dispatch(updateAccount(values.currentPassword,
        values.newPassword));
    } else {
      this.setState({ errors: errors });
    }
  }

  _onChange (event) {
    var values = {...this.state.values};
    var errors = {...this.state.errors};
    const attribute = event.target.getAttribute('name');
    const value = event.target.value;
    values[attribute] = value;
    delete errors[attribute];
    this.setState({values: values, errors: errors});
  }

  render () {
    const { errors, values } = this.state;
    return (
      <LayerForm title="Edit Local Account" submitLabel="OK"
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <fieldset>
          <Paragraph>Change the password for the
            local <strong>Administrator</strong> account.</Paragraph>
          <FormField key="currentPassword" htmlFor="currentPassword"
            label="Current password"
            error={errors.currentPassword}>
            <input id="currentPassword" name="currentPassword"
              type="password"
              value={values.currentPassword} onChange={this._onChange} />
          </FormField>
          <FormField key="newPassword" htmlFor="newPassword"
            label="New password"
            error={errors.newPassword}>
            <input id="newPassword" name="newPassword"
              type="password"
              value={values.newPassword} onChange={this._onChange} />
          </FormField>
        </fieldset>
      </LayerForm>
    );
  }
}

export default connect()(AccountEdit);
