// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadVmNetworks } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import FormField from 'grommet/components/FormField';
import Select from 'grommet/components/Select';
import CheckBox from 'grommet/components/CheckBox';
import Button from 'grommet/components/Button';
import TrashIcon from 'grommet/components/icons/base/Trash';
import NetworkSuggestion from './NetworkSuggestion';

class VirtualMachineEditNetwork extends Component {

  constructor (props) {
    super(props);

    this._onSubmit = this._onSubmit.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onNetworkSearch = this._onNetworkSearch.bind(this);
    this._onNetworkSelect = this._onNetworkSelect.bind(this);
    this._onToggleDhcp = this._onToggleDhcp.bind(this);

    this.state = {
      errors: {},
      network: this.props.network
    };
  }

  componentDidMount () {
    this.props.dispatch(loadVmNetworks());
  }

  componentWillReceiveProps (nextProps) {
    const networkSuggestions = nextProps.networks.map((network) => {
      return {
        network: network,
        label: <NetworkSuggestion name={network.name} vLanId={network.vLanId} />
      };
    });
    this.setState({ networkSuggestions: networkSuggestions });
  }

  _onSubmit () {
    const network = this.state.network;
    let errors = {};
    let noErrors = true;
    if (! network.name) {
      errors.name = 'required';
      noErrors = false;
    }
    if (noErrors) {
      this.props.onChange(network);
    } else {
      this.setState({errors: errors});
    }
  }

  _onChange (event) {
    var network = { ...this.state.network };
    var errors = { ...this.state.errors };
    const attribute = event.target.getAttribute('name');
    const value = event.target.value;
    network[attribute] = value;
    delete errors[attribute];
    this.setState({network: network, errors: errors});
  }

  _onNetworkSearch (event) {
    const networkSearchText = event.target.value;
    this.props.dispatch(loadVmNetworks(networkSearchText));
  }

  _onNetworkSelect (pseudoEvent) {
    let network = { ...this.state.network };
    network.name = pseudoEvent.option.network.name;
    network.uri = pseudoEvent.option.network.uri;
    this.setState({ network: network });
  }

  _onToggleDhcp () {
    let network = { ...this.state.network };
    network.dhcp = ! network.dhcp;
    this.setState({ network: network });
  }

  render () {
    const { network, errors } = this.state;
    let removeControl;
    if (this.props.onRemove) {
      removeControl = (
        <Button plain={true} icon={<TrashIcon />} label="Remove"
          onClick={this.props.onRemove}
          a11yTitle={`Remove ${network.name} Network`} />
      );
    }

    let nonDhcpFields;
    if (! network.dhcp) {
      nonDhcpFields = [
        <FormField key="ipV4Address" htmlFor="ipV4Address" label="IPv4 address"
          error={errors.ipV4Address} >
          <input id="ipV4Address" name="ipV4Address" type="text"
            value={network.ipV4Address} onChange={this._onChange} />
        </FormField>,
        <FormField key="ipV4Netmask" htmlFor="ipV4Netmask" label="IPv4 netmask"
          error={errors.ipV4Netmask} >
          <input id="ipV4Netmask" name="ipV4Netmask" type="text"
            value={network.ipV4Netmask} onChange={this._onChange} />
        </FormField>,
        <FormField key="ipV4Gateway" htmlFor="ipV4Gateway" label="IPv4 gateway"
          error={errors.ipV4Gateway} >
          <input id="ipV4Gateway" name="ipV4Gateway" type="text"
            value={network.ipV4Gateway} onChange={this._onChange} />
        </FormField>,
        <FormField key="ipV6Address" htmlFor="ipV6Address" label="IPv6 address"
          error={errors.ipV6Address} >
          <input id="ipV4Address" name="ipV6Address" type="text"
            value={network.ipV6Address} onChange={this._onChange} />
        </FormField>
      ];
    }

    return (
      <LayerForm title={this.props.heading} submitLabel="OK"
        onClose={this.props.onClose} onSubmit={this._onSubmit}
        secondaryControl={removeControl}>
        <fieldset>
          <FormField htmlFor="name" label="Network" error={errors.name}>
            <Select id="name" name="name"
              value={network.name}
              options={this.state.networkSuggestions}
              onChange={this._onNetworkSelect}
              onSearch={this._onNetworkSearch} />
          </FormField>
          <FormField htmlFor="dhcp">
            <CheckBox id="dhcp" name="dhcp" label="Use DHCP?"
              checked={network.dhcp} onChange={this._onToggleDhcp} />
          </FormField>
          {nonDhcpFields}
        </fieldset>
      </LayerForm>
    );
  }
}

VirtualMachineEditNetwork.propTypes = {
  heading: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onRemove: PropTypes.func,
  network: PropTypes.shape({
    name: PropTypes.string,
    uri: PropTypes.string
  }).isRequired
};

let select = (state) => {
  return {
    networks: state.vm.networks
  };
};

export default connect(select)(VirtualMachineEditNetwork);
