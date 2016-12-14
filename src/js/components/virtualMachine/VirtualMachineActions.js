// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { powerOnVm } from '../../actions/actions';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Box from 'grommet/components/Box';
import Sidebar from 'grommet/components/Sidebar';
import Menu from 'grommet/components/Menu';
import Button from 'grommet/components/Button';
import SkipLinkAnchor from 'grommet/components/SkipLinkAnchor';
import CameraIcon from 'grommet/components/icons/base/Camera';
import CloseIcon from 'grommet/components/icons/base/Close';
import CommandLineIcon from 'grommet/components/icons/base/Cli';
import EditIcon from 'grommet/components/icons/base/Edit';
import PowerIcon from 'grommet/components/icons/base/Power';
import TrashIcon from 'grommet/components/icons/base/Trash';
import VirtualMachineRemove from './VirtualMachineRemove';
import VirtualMachinePowerOff from './VirtualMachinePowerOff';
import VirtualMachineRestart from './VirtualMachineRestart';
import VirtualMachineTakeSnapshot from './VirtualMachineTakeSnapshot';
import VirtualMachineBusy from './VirtualMachineBusy';
import VirtualMachineOnline from './VirtualMachineOnline';

const LAYERS = {
  busy: VirtualMachineBusy,
  online: VirtualMachineOnline,
  powerOff: VirtualMachinePowerOff,
  remove: VirtualMachineRemove,
  restart: VirtualMachineRestart,
  takeSnapshot: VirtualMachineTakeSnapshot
};

class VirtualMachineShow extends Component {

  constructor (props) {
    super(props);
    this._onEdit = this._onEdit.bind(this);
    this._onLayerOpen = this._onLayerOpen.bind(this);
    this._onLayerClose = this._onLayerClose.bind(this);
    this._onPowerOn = this._onPowerOn.bind(this);

    this.state = {
      layerName: undefined
    };
  }

  _onEdit () {
    const { busy, virtualMachine } = this.props;
    const { router } = this.context;
    if (busy) {
      this.setState({ layerName: 'busy' });
    } else if ('Online' === virtualMachine.state) {
      this.setState({ layerName: 'online' });
    } else {
      router.push({
        pathname: `/virtual-machines/edit${virtualMachine.uri}`,
        search: document.location.search
      });
      if (this.props.onClose) {
        this.props.onClose();
      }
    }
  }

  _onLayerOpen (layerName) {
    this.setState({ layerName: (this.props.busy ? 'busy' : layerName) });
  }

  _onLayerClose () {
    this.setState({ layerName: undefined });
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  _onPowerOn () {
    if (this.props.busy) {
      this.setState({ layerName: 'busy' });
    } else {
      this.props.dispatch(powerOnVm(this.props.virtualMachine.uri));
      if (this.props.onClose) {
        this.props.onClose();
      }
    }
  }

  render () {
    const { virtualMachine, onClose } = this.props;

    let name;
    let closeControl;
    if (onClose) {
      name = <Heading tag="h3" margin='none'>{virtualMachine.name}</Heading>;
      closeControl = (
        <Button icon={<CloseIcon />} onClick={onClose}
          a11yTitle={`Close ${virtualMachine.name}`} />
      );
    }

    let stateControls;
    if ('Online' === virtualMachine.state) {
      stateControls = [
        <Button key="console" href="https://tbd" align="start" plain={true}
          icon={<CommandLineIcon />} label="Console"
          target="vmConsole" />,
        <Button key="restart" align="start" plain={true}
          icon={<PowerIcon />} label="Restart"
          onClick={this._onLayerOpen.bind(this, 'restart')} />,
        <Button key="powerOff" align="start" plain={true}
          icon={<PowerIcon />} label="Power Off"
          onClick={this._onLayerOpen.bind(this, 'powerOff')} />
      ];
    } else {
      stateControls = (
        <Button align="start" plain={true}
          icon={<PowerIcon />} label="Power On"
          onClick={this._onPowerOn} />
      );
    }

    let layer;
    if (this.state.layerName) {
      let Component = LAYERS[this.state.layerName];
      layer = (
        <Component virtualMachine={virtualMachine}
          onClose={this._onLayerClose} />
      );
    }

    return (
      <Sidebar size="medium" colorIndex="light-2">
        <SkipLinkAnchor label="Right Panel" />
        <Header pad={{horizontal: 'medium', vertical: 'medium'}}
          justify="between" size="large" >
          {name}
          {closeControl}
        </Header>
        <Box pad="medium">
          <Menu>
            {stateControls}
            <Button align="start" plain={true}
              icon={<CameraIcon />} label="Take Snapshot"
              onClick={this._onLayerOpen.bind(this, 'takeSnapshot')} />
            <Button align="start" plain={true}
              icon={<EditIcon />} label="Edit"
              onClick={this._onEdit}
              a11yTitle={`Edit ${virtualMachine.name} Virtual Machine`} />
            <Button align="start" plain={true}
              icon={<TrashIcon />} label="Remove"
              onClick={this._onLayerOpen.bind(this, 'remove')}
              a11yTitle={`Remove ${virtualMachine.name} Virtual Machine`} />
          </Menu>
        </Box>
        {layer}
      </Sidebar>
    );
  }
}

VirtualMachineShow.propTypes = {
  category: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  virtualMachine: PropTypes.object.isRequired
};

VirtualMachineShow.contextTypes = {
  router: PropTypes.object
};

export default connect()(VirtualMachineShow);
