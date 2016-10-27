// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadVmImages, loadItem, updateItem,
  unloadItem } from '../../actions/actions';
import Article from 'grommet/components/Article';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Form from 'grommet/components/Form';
import Footer from 'grommet/components/Footer';
import FormFields from 'grommet/components/FormFields';
import FormField from 'grommet/components/FormField';
import Box from 'grommet/components/Box';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import Select from 'grommet/components/Select';
import NumberInput from 'grommet/components/NumberInput';
import Button from 'grommet/components/Button';
import AddIcon from 'grommet/components/icons/base/Add';
import CloseIcon from 'grommet/components/icons/base/Close';
import EditIcon from 'grommet/components/icons/base/Edit';
import Anchor from 'grommet/components/Anchor';
import VirtualMachineEditNetwork from './VirtualMachineEditNetwork';

const NUMERIC_RANGES = {
  "vCpus": [1, 128],
  "memory": [1, 1024],
  "diskSpace": [10, 62000]
};

class VirtualMachineEdit extends Component {

  constructor (props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
    this._onLayerOpen = this._onLayerOpen.bind(this);
    this._onLayerClose = this._onLayerClose.bind(this);
    this._onImageSearch = this._onImageSearch.bind(this);
    this._onImageSelect = this._onImageSelect.bind(this);
    this._onNetworkAdd = this._onNetworkAdd.bind(this);
    this._onNetworkEdit = this._onNetworkEdit.bind(this);
    this._onNetworkRemove = this._onNetworkRemove.bind(this);
    this._onNetworkChange = this._onNetworkChange.bind(this);

    this.state = {
      errors: {},
      virtualMachine: props.virtualMachine
    };
  }

  componentDidMount () {
    this.props.dispatch(loadItem(this.props.uri, false));
  }

  componentWillReceiveProps (nextProps) {
    if (! this.state.virtualMachine || ! this.state.virtualMachine.uri) {
      this.setState({ virtualMachine: nextProps.virtualMachine });
    }
  }

  componentWillUnmount () {
    this.props.dispatch(unloadItem(this.props.virtualMachine, false));
  }

  _onSubmit (event) {
    event.preventDefault();
    const { router } = this.context;
    let virtualMachine = this.state.virtualMachine;
    let errors = {};
    let noErrors = true;
    if (! virtualMachine.name) {
      errors.name = 'required';
      noErrors = false;
    }
    if (noErrors) {
      this.props.dispatch(updateItem(virtualMachine));
      router.push({
        pathname: `/virtual-machines${virtualMachine.uri}`,
        search: document.location.search
      });
    } else {
      this.setState({ errors: errors });
    }
  }

  _change (contextProperty, property) {
    return (event) => {
      let virtualMachine = { ...this.state.virtualMachine };
      let errors = { ...this.state.errors };
      let value = event.target.value;

      const range = NUMERIC_RANGES[property];
      if (range) {
        value = parseInt(value, 10);
        if (! value || value < range[0] || value > range[1]) {
          errors[property] = `Must be between ${range[0]} and ${range[1]}`;
        } else {
          delete errors[property];
        }
      }

      if (contextProperty) {
        let context = { ...virtualMachine[contextProperty] };
        context[property] = value;
        virtualMachine[contextProperty] = context;
      } else {
        if ('count' === property) {
          value = parseInt(value, 10);
        }
        virtualMachine[property] = value;
      }

      this.setState({ virtualMachine: virtualMachine, errors: errors });
    };
  }

  _onLayerOpen (name) {
    this.setState({layer: name});
  }

  _onLayerClose () {
    this.setState({layer: null});
  }

  _onImageSearch (event) {
    const imageSearchText = event.target.value;
    let virtualMachine = { ...this.state.virtualMachine };
    virtualMachine.image = {};
    this.setState({ virtualMachine: virtualMachine });
    this.props.dispatch(loadVmImages(imageSearchText));
  }

  _onImageSelect (pseudoEvent) {
    let virtualMachine = { ...this.state.virtualMachine };
    virtualMachine.image = pseudoEvent.option;
    this.setState({ virtualMachine: virtualMachine });
  }

  _onNetworkEdit (index) {
    this.setState({ editNetworkIndex: index, layer: 'network' });
  }

  _onNetworkAdd () {
    this.setState({ addNetwork: true, layer: 'network' });
  }

  _onNetworkRemove () {
    let virtualMachine = { ...this.props.virtualMachine };
    virtualMachine.networks.splice(this.state.editNetworkIndex, 1);
    this.setState({
      virtualMachine: virtualMachine,
      layer: null,
      editNetworkIndex: -1
    });
  }

  _onNetworkChange (network) {
    let virtualMachine = { ...this.props.virtualMachine };
    if (this.state.addNetwork) {
      virtualMachine.networks.push(network);
    } else {
      virtualMachine.networks[this.state.editNetworkIndex] = network;
    }
    this.setState({
      virtualMachine: virtualMachine,
      layer: null,
      addNetwork: false,
      editNetworkIndex: -1
    });
  }

  _renderNameField () {
    const { virtualMachine, errors } = this.state;
    return (
      <FormField label="Name" htmlFor="hostName" error={errors.name}>
        <input id="hostName" name="name" type="text"
          value={virtualMachine.name || ''}
          onChange={this._change(null, 'name')} />
      </FormField>
    );
  }

  _renderSizeFields () {
    const { virtualMachine, errors } = this.state;
    const size = virtualMachine.size || {};

    return (
      <fieldset>
        <Heading tag="h3">Sizing</Heading>
        <FormField label="vCPUs" htmlFor="vCpus" error={errors.vCpus}>
          <NumberInput id="vCpus" name="size.vCpus" min={1} max={128}
            value={size.vCpus || 0}
            onChange={this._change('size', 'vCpus')} />
        </FormField>
        <FormField label="Memory (GB)" htmlFor="memory" error={errors.memory}>
          <NumberInput id="memory" name="size.memory" min={1} max={1024}
            value={size.memory || 0}
            onChange={this._change('size', 'memory')} />
        </FormField>
        <FormField label="Disk space (GB)" htmlFor="diskSpace"
          error={errors.diskSpace}>
          <NumberInput id="diskSpace" name="size.diskSpace"
            min={10} step={10} max={62000}
            value={size.diskSpace || 0}
            onChange={this._change('size', 'diskSpace')} />
        </FormField>
      </fieldset>
    );
  }

  _renderImageField () {
    const { virtualMachine, errors } = this.state;
    const { images } = this.props;
    const image = virtualMachine.image || {};
    return (
      <fieldset>
        <Heading tag="h3">Attached Disk Image</Heading>
        <FormField label="Image" htmlFor="image" error={errors.image}>
          <Select id="image" name="image"
            value={image.name || ''}
            options={images}
            onChange={this._onImageSelect}
            onSearch={this._onImageSearch} />
        </FormField>
      </fieldset>
    );
  }

  _renderNetworkFields () {
    const { virtualMachine } = this.state;
    const networks = (virtualMachine.networks || []).map((network, index) => {
      return (
        <ListItem key={index} justify="between" pad="none"
          separator={index === 0 ? 'horizontal' : 'bottom'}
          responsive={false}>
          <span>
            {network.name}
            <span className="secondary">{network.vLanId}</span>
          </span>
          <Button icon={<EditIcon />}
            onClick={this._onNetworkEdit.bind(this, index)}
            a11yTitle={`Edit ${network.name} Network`} />
        </ListItem>
      );
    });
    return (
      <fieldset>
        <Header size="small" justify="between">
          <Heading tag="h3">Networks</Heading>
          <Button icon={<AddIcon />} onClick={this._onNetworkAdd}
            a11yTitle="Add Network" />
        </Header>
        <List>
          {networks}
        </List>
      </fieldset>
    );
  }

  _renderLayer () {
    const { virtualMachine, layer, addNetwork, editNetworkIndex } = this.state;
    let result;
    if (layer) {
      if ('network' === layer) {
        let network = (addNetwork ? { dhcp: true } :
          virtualMachine.networks[editNetworkIndex]);
        let heading = (addNetwork ? 'Add Network' : 'Edit Network');
        let onRemove = (addNetwork ? null : this._onNetworkRemove);
        result = (
          <VirtualMachineEditNetwork onClose={this._onLayerClose}
            heading={heading}
            network={network} onChange={this._onNetworkChange}
            onRemove={onRemove} />
        );
      }
    }
    return result;
  }

  render () {
    const { virtualMachine } = this.state;

    let guidance;
    if ('Online' === virtualMachine.state) {
      const message = "This virtual machine is currently online. " +
        "Changes to the size or networks will not take effect until " +
        "the virtual machine is restarted.";
      guidance = <Box colorIndex="light-2" pad="medium">{message}</Box>;
    }
    const nameField = this._renderNameField();
    const sizeFields = this._renderSizeFields();
    const imageField = this._renderImageField();
    const networkFields = this._renderNetworkFields();

    const layer = this._renderLayer();

    return (
      <Article align="center" pad={{horizontal: 'medium'}} primary={true}>
        <Form onSubmit={this._onSubmit}>

          <Header size="large" justify="between" pad="none">
            <Heading tag="h2" margin="none" strong={true}>
              Edit Virtual Machine
            </Heading>
            <Anchor icon={<CloseIcon />}
              path={`/virtual-machines${this.props.uri}`}
              a11yTitle='Close Edit Virtual Machine Form'/>
          </Header>

          <FormFields>

            <fieldset>
              {nameField}
            </fieldset>

            {guidance}
            {sizeFields}
            {imageField}
            {networkFields}

          </FormFields>

          <Footer pad={{vertical: 'medium'}}>
            <Button type="submit" primary={true} label="OK"
              onClick={this._onSubmit} />
          </Footer>
        </Form>
        {layer}
      </Article>
    );
  }
}

VirtualMachineEdit.propTypes = {
  changing: PropTypes.bool.isRequired,
  networks: PropTypes.arrayOf(PropTypes.object).isRequired,
  sizes: PropTypes.arrayOf(PropTypes.object).isRequired,
  uri: PropTypes.string,
  virtualMachine: PropTypes.object
};

VirtualMachineEdit.contextTypes = {
  router: PropTypes.object
};

let select = (state, props) => {
  return {
    changing: state.item.changing,
    item: state.item,
    images: state.vm.images,
    networks: state.vm.networks,
    sizes: state.vm.sizes,
    uri: '/' + props.params.splat,
    virtualMachine: state.item.item || {}
  };
};

export default connect(select)(VirtualMachineEdit);
