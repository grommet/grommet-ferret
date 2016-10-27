// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { changeSettings } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import Paragraph from 'grommet/components/Paragraph';
import FormField from 'grommet/components/FormField';
import ErrorList from './ErrorList';

class IdentityEdit extends Component {

  constructor (props) {
    super(props);

    this._onSubmit = this._onSubmit.bind(this);
    this._onChange = this._onChange.bind(this);

    this.state = {
      settings: {...props.settings},
      errors: {}
    };
  }

  _onSubmit () {
    let errors = {};
    let noErrors = true;
    if (! this.state.settings.name) {
      errors.name = 'required';
      noErrors = false;
    }
    if (! this.state.settings.network.ipV4Address) {
      errors.ipV4Address = 'required';
      noErrors = false;
    }
    if (noErrors) {
      this.props.dispatch(changeSettings(this.state.settings));
      this.props.onClose();
    } else {
      this.setState({errors: errors});
    }
  }

  _onChange (event) {
    var settings = {...this.state.settings};
    var errors = {...this.state.errors};
    const attribute = event.target.getAttribute('name');
    const value = event.target.value || '';
    const parts = attribute.split('.');
    let context = settings;
    while (parts.length > 1) {
      context = context[parts.shift()];
    }
    context[parts[0]] = value;
    delete errors[attribute];
    this.setState({settings: settings, errors: errors});
  }

  render () {
    const { productName } = this.props;
    const { settings, errors } = this.state;

    let networkErrors;
    if (settings.errors && settings.errors.network) {
      networkErrors = <ErrorList errors={settings.errors.network} />;
    }

    const ipV4AddressHelp = (
      "Changing the address will necessitate reconnecting your browser"
    );

    return (
      <LayerForm title="Identity" submitLabel="OK"
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <Paragraph>
          Your {productName + "'s"} name and identity on the network.
        </Paragraph>
        <fieldset>
          <FormField htmlFor="name" label="Name" error={errors.name}
            help="Typically the vCenter cluster name but can be anything.">
            <input id="name" name="name" type="text"
              value={settings.name || ''} onChange={this._onChange} />
          </FormField>
        </fieldset>
        <fieldset>
          {networkErrors}
          <FormField htmlFor="ipV4Address" label="IPv4 address"
            help={ipV4AddressHelp} error={errors.ipV4Address} >
            <input id="ipV4Address" name="network.ipV4Address" type="text"
              value={settings.network.ipV4Address || ''}
              onChange={this._onChange} />
          </FormField>
          <FormField htmlFor="ipV4Netmask" label="IPv4 netmask"
            error={errors.ipV4Netmask} >
            <input id="ipV4Netmask" name="network.ipV4Netmask" type="text"
              value={settings.network.ipV4Netmask || ''}
              onChange={this._onChange} />
          </FormField>
          <FormField htmlFor="ipV4Gateway" label="IPv4 gateway"
            error={errors.ipV4Gateway} >
            <input id="ipV4Gateway" name="network.ipV4Gateway" type="text"
              value={settings.network.ipV4Gateway || ''}
              onChange={this._onChange} />
          </FormField>
          <FormField htmlFor="ipV6Address" label="IPv6 address"
            error={errors.ipV6Address} >
            <input id="ipV4Address" name="network.ipV6Address" type="text"
              value={settings.network.ipV6Address || ''}
              onChange={this._onChange} />
          </FormField>
          <FormField htmlFor="dns1" error={errors.dns1}
            label="Domain Name Server (DNS) first address">
            <input id="dns1" name="network.dns1" type="text"
              value={settings.network.dns1 || ''} onChange={this._onChange} />
          </FormField>
          <FormField htmlFor="dns2" error={errors.dns2}
            label="Domain Name Server (DNS) second address">
            <input id="dns2" name="network.dns2" type="text"
              value={settings.network.dns2 || ''}
              onChange={this._onChange} />
          </FormField>
        </fieldset>
        <fieldset>
          <FormField htmlFor="dataCenter" label="Data center" >
            <input id="dataCenter" name="dataCenter" type="text"
              value={settings.dataCenter || ''} onChange={this._onChange} />
          </FormField>
        </fieldset>
      </LayerForm>
    );
  }
}

IdentityEdit.propTypes = {
  onClose: PropTypes.func,
  productName: PropTypes.string,
  settings: PropTypes.object.isRequired
};

let select = (state) => ({
  productName: state.settings.productName.short,
  settings: state.settings.settings
});

export default connect(select)(IdentityEdit);
