// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import merge from 'lodash/object/merge';
import Form from 'grommet/components/Form';
import Menu from 'grommet/components/Menu';
import Footer from 'grommet/components/Footer';
import FormFields from 'grommet/components/FormFields';
import FormField from 'grommet/components/FormField';
import SearchInput from 'grommet/components/SearchInput';
import CheckBox from 'grommet/components/CheckBox';
import RadioButton from 'grommet/components/RadioButton';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';
import Header from 'grommet/components/Header';
import Button from 'grommet/components/Button';
import CloseIcon from 'grommet/components/icons/Clear';
import Rest from 'grommet/utils/Rest';
import ServerProfileConnectionAdd from './ServerProfileConnectionAdd';
import ServerProfileVolumeAdd from './ServerProfileVolumeAdd';
import BusyIcon from 'grommet/components/icons/Spinning';
import Grobject from 'grommet/components/Object';

class ServerProfileForm extends Component {

  constructor(props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onServerHardwareChange = this._onServerHardwareChange.bind(this);
    this._onServerHardwareSearch = this._onServerHardwareSearch.bind(this);
    this._onServerHardwareSearchResponse =
      this._onServerHardwareSearchResponse.bind(this);
    this._onFirmwareChange = this._onFirmwareChange.bind(this);
    this._onFirmwareSearch = this._onFirmwareSearch.bind(this);
    this._onFirmwareSearchResponse = this._onFirmwareSearchResponse.bind(this);
    this._onAddConnection = this._onAddConnection.bind(this);
    this._onNewConnectionOpen = this._onNewConnectionOpen.bind(this);
    this._onNewConnectionClose = this._onNewConnectionClose.bind(this);
    this._onRemoveConnection = this._onRemoveConnection.bind(this);
    this._onAddVolume = this._onAddVolume.bind(this);
    this._onNewVolumeOpen = this._onNewVolumeOpen.bind(this);
    this._onNewVolumeClose = this._onNewVolumeClose.bind(this);
    this._onRemoveVolume = this._onRemoveVolume.bind(this);

    this.state = {
      serverProfile: merge({}, props.serverProfile),
      serverHardwareSuggestions: [],
      firmwareSuggestions: []
    };
  }

  componentDidMount() {
    this._onServerHardwareSearch('');
    this._onFirmwareSearch('');
  }

  componentWillReceiveProps(newProps) {
    this.setState({serverProfile: newProps.serverProfile});
  }

  _onSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state.serverProfile);
  }

  _onChange(event) {
    var serverProfile = this.state.serverProfile;
    serverProfile[event.target.getAttribute('name')] = event.target.value;
    this.setState({serverProfile: serverProfile});
  }

  _onServerHardwareChange(value) {
    var serverProfile = this.state.serverProfile;
    var serverHardware = {uri: value.value, name: value.label};
    serverProfile.serverHardware = serverHardware;
    this.setState({serverProfile: serverProfile});
  }

  _onServerHardwareSearchResponse(err, res) {
    if (err) {
      throw err;
    }

    if (res.ok) {
      var suggestions = res.body.map(function (item) {
        return {value: item.uri, label: item.name};
      });
      this.setState({serverHardwareSuggestions: suggestions});
    }
  }

  _onServerHardwareSearch(value) {
    var params = {category: 'server-hardware', query: value,
      start: 0, count: 5};
    Rest.get('/rest/index/search-suggestions', params)
      .end(this._onServerHardwareSearchResponse);
  }

  _onFirmwareChange(value) {
    var serverProfile = this.state.serverProfile;
    serverProfile.firmware = value;
    this.setState({serverProfile: serverProfile});
  }

  _onFirmwareSearchResponse(err, res) {
    if (err) {
      throw err;
    }

    if (res.ok) {
      var names = res.body.map(function (item) {
        return item.name;
      });
      this.setState({firmwareSuggestions: names});
    }
  }

  _onFirmwareSearch(value) {
    var params = {category: 'firmware-drivers', query: value,
      start: 0, count: 5};
    Rest.get('/rest/index/search-suggestions', params)
      .end(this._onFirmwareSearchResponse);
  }

  _onAddConnection(connection) {
    var serverProfile = this.state.serverProfile;
    if (! serverProfile.hasOwnProperty('connections')) {
      serverProfile.connections = [];
    }
    serverProfile.connections.push(connection);
    this.setState({serverProfile: serverProfile});
  }

  _onNewConnectionOpen(event) {
    event.preventDefault();
    this.setState({addConnection: true});
  }

  _onNewConnectionClose() {
    this.setState({addConnection: false});
  }

  _onRemoveConnection(index) {
    var serverProfile = this.state.serverProfile;
    serverProfile.connections.splice(index, 1);
    this.setState({serverProfile: serverProfile});
  }

  _onAddVolume(volume) {
    var serverProfile = this.state.serverProfile;
    serverProfile.volumes.push(volume);
    this.setState({serverProfile: serverProfile});
  }

  _onNewVolumeOpen(event) {
    event.preventDefault();
    this.setState({addVolume: true});
  }

  _onNewVolumeClose() {
    this.setState({addVolume: false});
  }

  _onRemoveVolume(index) {
    var serverProfile = this.state.serverProfile;
    serverProfile.volumes.splice(index, 1);
    this.setState({serverProfile: serverProfile});
  }

  _renderConnections() {
    return this.state.serverProfile.connections.map(function (connection, index) {
      return (
        <Tile key={connection.name} align="start" pad="none">
          <Header small={true} justify="between">
            {connection.name}
            <Button type="icon"
              onClick={this._onRemoveConnection.bind(this, index)}>
              <CloseIcon />
            </Button>
          </Header>
          <Grobject data={connection} />
        </Tile>
      );
    }, this);
  }

  _renderVolumes() {
    return this.state.serverProfile.volumes.map(function (volume, index) {
      return (
        <Tile key={volume.name} align="start" pad="none">
          <Header small={true} justify="between">
            {volume.name}
            <Button type="icon"
              onClick={this._onRemoveVolume.bind(this, index)}>
              <CloseIcon />
            </Button>
          </Header>
        </Tile>
      );
    }, this);
  }

  render() {
    var serverProfile = this.state.serverProfile;

    var connections;
    if (serverProfile.connections) {
      connections = this._renderConnections();
    }

    var addConnection = null;
    if (this.state.addConnection) {
      addConnection = (
        <ServerProfileConnectionAdd
          onAdd={this._onAddConnection}
          onClose={this._onNewConnectionClose} />
      );
    }

    var volumes;
    if (serverProfile.volumes) {
      volumes = this._renderVolumes();
    }

    var addVolume = null;
    if (this.state.addVolume) {
      addVolume = (
        <ServerProfileVolumeAdd
          onAdd={this._onAddVolume}
          onClose={this._onNewVolumeClose} />
      );
    }

    var actions = null;
    if (this.props.processingMessage) {
      actions = <span><BusyIcon /> {this.props.processingMessage}</span>;
    } else {
      actions = (
        <Button type="submit" primary={true}
          label={this.props.buttonLabel} onClick={this._onSubmit} />
      );
    }

    var serverHardwareValue;
    if (serverProfile.serverHardware) {
      serverHardwareValue = {
        value: serverProfile.serverHardware.uri,
        label: serverProfile.serverHardware.name
      };
    }

    return (
      <Form pad="medium" onSubmit={this._onSubmit}>
        <FormFields>

          <fieldset>
            <legend>General</legend>
            <FormField label="Name" htmlFor="name">
              <input id="name" name="name" type="text" autoFocus
                value={serverProfile.name} onChange={this._onChange} />
            </FormField>
            <FormField label="Description" htmlFor="description">
              <input id="description" name="description" type="text"
                value={serverProfile.description} onChange={this._onChange} />
            </FormField>
            <FormField label="Server hardware" htmlFor="serverHardware">
              <SearchInput id="serverHardware" name="serverHardware"
                value={serverHardwareValue}
                suggestions={this.state.serverHardwareSuggestions}
                onChange={this._onServerHardwareChange}
                onSearch={this._onServerHardwareSearch} />
            </FormField>
            <FormField label="Affinity" htmlFor="affinity">
              <select id="affinity" name="affinity"
                value={serverProfile.affinity}
                onChange={this._onChange}>
                <option>Device bay</option>
                <option>Device bay and hardware</option>
              </select>
            </FormField>
          </fieldset>

          <fieldset>
            <legend>Firmware</legend>
            <FormField label="Firmware baseline" htmlFor="firmware">
              <SearchInput id="firmware" name="firmware"
                value={serverProfile.firmware}
                suggestions={this.state.firmwareSuggestions}
                onChange={this._onFirmwareChange}
                onSearch={this._onFirmwareSearch} />
            </FormField>
          </fieldset>

          <fieldset>
            <legend>Connections</legend>
            <Tiles flush={true}>
              {connections}
            </Tiles>
            <Button label="Add Connection"
              onClick={this._onNewConnectionOpen} />
          </fieldset>

          <fieldset>
            <legend>Local Storage</legend>
            <CheckBox id="manageLocalStorage" name="manageLocalStorage"
              label="Manage local storage"
              checked={serverProfile.manageLocalStorage}
              onChange={this._onChange}/>
            <FormField label="Logical drive" htmlFor="logicalDrive">
              <select id="logicalDrive" name="logicalDrive"
                value={serverProfile.logicalDrive}
                onChange={this._onChange}>
                <option>None</option>
                <option>RAID 0</option>
                <option>RAID 1</option>
              </select>
            </FormField>
            <FormField htmlFor="logicalDriveBootable">
              <CheckBox id="logicalDriveBootable" name="logicalDriveBootable"
                label="Bootable"
                checked={serverProfile.logicalDriveBootable}
                onChange={this._onChange}/>
            </FormField>
            <FormField htmlFor="logicalDriveInitialize">
              <CheckBox id="logicalDriveInitialize" name="logicalDriveInitialize"
                label="Initialize"
                checked={serverProfile.logicalDriveInitialize}
                onChange={this._onChange}/>
            </FormField>
          </fieldset>

          <fieldset>
            <legend>SAN Storage</legend>
            <CheckBox id="manageSanStorage" name="manageSanStorage"
              label="Manage SAN storage"
              checked={serverProfile.manageSanStorage}
              onChange={this._onChange}/>
            <FormField label="Host OS type" htmlFor="hostOsType">
              <select id="hostOsType" name="hostOsType"
                value={serverProfile.hostOsType}
                onChange={this._onChange}>
                <option>AIX</option>
                <option>Citrix Xen Server (5.x, 6.x)</option>
                <option>ESX (4.x, 5.x)</option>
                <option>Egenera</option>
                <option>Exanet</option>
                <option>HP-UX</option>
                <option>IBM VIO Server</option>
                <option>InForm</option>
                <option>NetApp/ONTAP</option>
                <option>OE Linux UEK (5.x, 6.x)</option>
                <option>Open VMS</option>
                <option>RHE Linux (5.x, 6.x)</option>
                <option>Solaris (11.x)</option>
                <option>SuSE (10.x, 11.x)</option>
                <option>Windows 2008</option>
                <option>Windows 2012</option>
              </select>
            </FormField>
            <h5>Volumes</h5>
            <Tiles flush={false}>
              {volumes}
            </Tiles>
            <Button label="Add Volume"
              onClick={this._onNewVolumeOpen} />
          </fieldset>

          <fieldset>
            <legend>Boot</legend>
            <CheckBox id="manageBootOrder" name="manageBootOrder"
              label="Manage boot order"
              checked={serverProfile.manageBootOrder}
              onChange={this._onChange}/>
          </fieldset>

          <fieldset>
            <legend>BIOS/UEFI</legend>
            <CheckBox id="manageBios" name="manageBios"
              label="Manage BIOS"
              checked={serverProfile.manageBios}
              onChange={this._onChange}/>
          </fieldset>

          <fieldset>
            <legend>Advanced</legend>
            <FormField label="Hide unused FlexNICs">
              <RadioButton id="hideYes" name="hideUnusedNics" label="Yes"
                checked={serverProfile.hideUnusedNics}
                onChange={this._onChange} />
              <RadioButton id="hideNo" name="hideUnusedNics" label="No"
                checked={! serverProfile.hideUnusedNics}
                onChange={this._onChange} />
            </FormField>
          </fieldset>

        </FormFields>

        <Footer pad={{vertical: 'medium'}}>
          <span></span>
          <Menu direction="row">
            {actions}
          </Menu>
        </Footer>

        {addConnection}
        {addVolume}
      </Form>
    );
  }
}

ServerProfileForm.propTypes = {
  buttonLabel: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  processingMessage: PropTypes.string,
  serverProfile: PropTypes.object.isRequired
};

module.exports = ServerProfileForm;
