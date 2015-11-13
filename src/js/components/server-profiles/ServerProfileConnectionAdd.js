// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import merge from 'lodash/object/merge';
import Layer from 'grommet/components/Layer';
import Form from 'grommet/components/Form';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Menu from 'grommet/components/Menu';
import Footer from 'grommet/components/Footer';
import FormFields from 'grommet/components/FormFields';
import FormField from 'grommet/components/FormField';
import SearchInput from 'grommet/components/SearchInput';
import RadioButton from 'grommet/components/RadioButton';
import Button from 'grommet/components/Button';
import Rest from 'grommet/utils/Rest';

class ServerProfileConnectionAdd extends Component {

  constructor() {
    super();

    this._onAdd = this._onAdd.bind(this);
    this._onAddPlus = this._onAddPlus.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onNetworkChange = this._onNetworkChange.bind(this);
    this._onNetworkSearch = this._onNetworkSearch.bind(this);
    this._onNetworkSearchResponse = this._onNetworkSearchResponse.bind(this);

    this.state = {
      connection: {
        name: '',
        type: 'Ethernet',
        network: '',
        bandwidth: 2.5,
        port: 'Auto',
        boot: 'Not bootable'
      },
      addedCount: 0,
      primaryAction: 'Add',
      networkSuggestions: []
    };
  }

  componentDidMount() {
    this._onNetworkSearch('');
    this.refs.first.focus();
  }

  _onAdd(event) {
    event.preventDefault();
    this.props.onAdd(merge({}, this.state.connection));
    this.setState({primaryAction: 'Add'});
    this.props.onClose();
  }

  _onAddPlus(event) {
    event.preventDefault();
    var connection = this.state.connection;
    this.props.onAdd(merge({}, connection));
    connection.name = '';
    connection.network = '';
    this.setState({
      primaryAction: 'Add +',
      connection: connection,
      addedCount: this.state.addedCount + 1
    });
  }

  _onChange(event) {
    var name = event.target.getAttribute('name');
    var connection = this.state.connection;
    connection[name] = event.target.value;
    var getSuggestions;
    if ('type' === name) {
      getSuggestions = this._onNetworkSearch;
    }
    this.setState({connection: connection}, getSuggestions);
  }

  _onNetworkChange(value) {
    var connection = this.state.connection;
    connection.network = value;
    this.setState({connection: connection});
  }

  _onNetworkSearchResponse(err, res) {
    if (err) {
      throw err;
    }

    if (res.ok) {
      var names = res.body.map(function (item) {
        return item.name;
      });
      this.setState({networkSuggestions: names});
    }
  }

  _onNetworkSearch(value) {
    var category;
    if ('Ethernet' === this.state.connection.type) {
      category = 'ethernet-networks';
    } else {
      category = 'fc-networks';
    }
    var params = {category: category, query: value,
      start: 0, count: 5};
    Rest.get('/rest/index/search-suggestions', params)
      .end(this._onNetworkSearchResponse);
  }

  render() {
    var connection = this.state.connection;

    var primaryAdd = 'Add' === this.state.primaryAction;
    var actions = [
      <Button key="add" label="Add" primary={primaryAdd} onClick={this._onAdd} />,
      <Button key="addplus" label="Add +" primary={!primaryAdd}
        onClick={this._onAddPlus} />
    ];

    var message;
    if (this.state.addedCount) {
      message = '' + this.state.addedCount + ' added';
    }

    return (
      <Layer align="right" onClose={this.props.onClose} closer={true} flush={true}>
        <Form onSubmit={this._onAdd}>
          <Header>
            <Title>Add Connection</Title>
          </Header>
          <FormFields>
            <fieldset>
              <FormField label="Name" htmlFor="name">
                <input ref="first" id="name" name="name" type="text"
                  value={connection.name}
                  onChange={this._onChange} />
              </FormField>
              <FormField label="Device type">
                <RadioButton name="type" id="type-ethernet" label="Ethernet"
                  checked={connection.type === 'Ethernet'}
                  onChange={this._onChange} />
                <RadioButton name="type" id="type-fibre-channel" label="Fibre Channel"
                  checked={connection.type === 'Fibre Channel'}
                  onChange={this._onChange} />
              </FormField>
              <FormField label="Network" htmlFor="network">
                <SearchInput id="network" name="network"
                  value={connection.network}
                  suggestions={this.state.networkSuggestions}
                  onChange={this._onNetworkChange}
                  onSearch={this._onNetworkSearch} />
              </FormField>
              <FormField label="Requested bandwidth (Gb/s)" htmlFor="bandwidth">
                <input id="bandwidth" name="bandwidth" type="number"
                  min="0.1" max="10" step="0.1"
                  value={connection.bandwidth}
                  onChange={this._onChange} />
              </FormField>
              <FormField label="Port" htmlFor="port">
                <select id="port" name="port"
                  value={connection.port}
                  onChange={this._onChange}>
                  <option>Auto</option>
                  <option>FlexibleLOM 1:1-a</option>
                  <option>None</option>
                </select>
              </FormField>
            </fieldset>
          </FormFields>
          <Footer pad={{vertical: 'medium'}}>
            <Menu direction="row">
              {actions}
            </Menu>
            <span>{message}</span>
          </Footer>
        </Form>
      </Layer>
    );
  }
}

ServerProfileConnectionAdd.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

module.exports = ServerProfileConnectionAdd;
