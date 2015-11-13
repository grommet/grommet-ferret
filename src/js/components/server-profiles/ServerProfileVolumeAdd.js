// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import merge from 'lodash/object/merge';
import Layer from 'grommet/components/Layer';
import Form from 'grommet/components/Form';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Menu from 'grommet/components/Menu';
import Footer from 'grommet/components/Footer';
import Button from 'grommet/components/Button';
import FormFields from 'grommet/components/FormFields';
import FormField from 'grommet/components/FormField';

class ServerProfileVolumeAdd extends Component {

  constructor() {
    super();

    this._onAdd = this._onAdd.bind(this);
    this._onAddPlus = this._onAddPlus.bind(this);
    this._onChange = this._onChange.bind(this);

    this.state = {
      volume: {
        name: ''
      },
      addedCount: 0,
      primaryAction: 'Add'
    };
  }

  componentDidMount() {
    this.refs.first.focus();
  }

  _onAdd(event) {
    event.preventDefault();
    this.props.onAdd(merge({}, this.state.volume));
    this.setState({primaryAction: 'Add'});
    this.props.onClose();
  }

  _onAddPlus(event) {
    event.preventDefault();
    var volume = this.state.volume;
    this.props.onAdd(merge({}, volume));
    volume.name = '';
    this.setState({
      primaryAction: 'Add +',
      volume: volume,
      addedCount: this.state.addedCount + 1
    });
  }

  _onChange(event) {
    var name = event.target.getAttribute('name');
    var volume = this.state.volume;
    volume[name] = event.target.value;
    this.setState({volume: volume});
  }

  render() {
    var volume = this.state.volume;

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
            <Title>Add Volume</Title>
          </Header>
          <FormFields>
            <fieldset>
              <FormField label="Name" htmlFor="name">
                <input ref="first" id="name" name="name" type="text"
                  value={volume.name}
                  onChange={this._onChange} />
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

ServerProfileVolumeAdd.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

module.exports = ServerProfileVolumeAdd;
