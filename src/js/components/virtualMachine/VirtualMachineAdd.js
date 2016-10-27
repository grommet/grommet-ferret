// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { addMultipleVms, loadVmSizes, loadVmImages,
  addItem } from '../../actions/actions';
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
import RadioButton from 'grommet/components/RadioButton';
import Tiles from 'grommet/components/Tiles';
import Button from 'grommet/components/Button';
import AddIcon from 'grommet/components/icons/base/Add';
import CloseIcon from 'grommet/components/icons/base/Close';
import EditIcon from 'grommet/components/icons/base/Edit';
import SizeTile from '../size/SizeTile';
import SizeSuggestion from '../size/SizeSuggestion';
import Anchor from 'grommet/components/Anchor';
import VirtualMachineEditNetwork from './VirtualMachineEditNetwork';

class VirtualMachineAdd extends Component {

  constructor (props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
    this._onLayerOpen = this._onLayerOpen.bind(this);
    this._onLayerClose = this._onLayerClose.bind(this);
    this._onSizeSearch = this._onSizeSearch.bind(this);
    this._onSizeSuggestionSelect = this._onSizeSuggestionSelect.bind(this);
    this._onImageSearch = this._onImageSearch.bind(this);
    this._onImageSelect = this._onImageSelect.bind(this);
    this._onNetworkAdd = this._onNetworkAdd.bind(this);
    this._onNetworkEdit = this._onNetworkEdit.bind(this);
    this._onNetworkRemove = this._onNetworkRemove.bind(this);
    this._onNetworkChange = this._onNetworkChange.bind(this);
    this._onSizeTileSelect = this._onSizeTileSelect.bind(this);

    this.state = {
      count: 1,
      errors: {},
      images: [],
      imageSearchText: undefined,
      layer: undefined,
      naming: {
        type: 'prefix', // prefix | manual | extend
        prefix: 'vm-',
        start: 1,
        names: [],
        extend: undefined // {name: , uri: }
      },
      sizes: [],
      template: {
        category: 'virtual-machines',
        image: {}, // {name: , uri: }
        name: undefined,
        networks: [], // {name: , uri: }, ...
        size: {} // {
        //   name: null,
        //   uri: null,
        //   vCpus: 4,
        //   memory: 16,
        //   diskSpace: 2
        // },
      }
    };
  }

  componentDidMount () {
    this.props.dispatch(loadVmSizes());
    this.props.dispatch(loadVmImages());
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      sizes: nextProps.sizes,
      maxSizes: Math.max(nextProps.sizes.length, this.state.sizes.length)
    });
  }

  _onSubmit (event) {
    event.preventDefault();
    const { router } = this.context;
    const { count, template } = this.state;
    let errors = {};
    let noErrors = true;
    if (1 === count && ! template.name) {
      errors.name = 'required';
      noErrors = false;
    }
    if (! template.size || ! template.size.name) {
      errors.size = 'required';
      noErrors = false;
    }
    if (! template.image || ! template.image.uri) {
      errors.image = 'required';
      noErrors = false;
    }
    if (noErrors) {
      if (1 === count) {
        this.props.dispatch(addItem(this.state.template));
      } else {
        this.props.dispatch(addMultipleVms(this.props.count, this.props.naming,
          this.props.template));
      }
      router.push({
        pathname: '/virtual-machines',
        search: document.location.search
      });
    } else {
      this.setState({ errors: errors });
    }
  }

  _change (contextProperty, property, index) {
    return (event) => {
      let errors = { ...this.state.errors };
      let value = event.target.value;

      delete errors[property];
      let nextState = { errors: errors };

      if (contextProperty) {
        let context = { ...this.state[contextProperty] };
        if (undefined !== index) {
          let values = context[property].splice(0);
          values[index] = value;
          context[property] = values;
        } else {
          context[property] = value;
        }
        nextState[contextProperty] = context;
      } else {
        if ('count' === property) {
          value = parseInt(value, 10);
        }
        nextState[property] = value;
      }

      this.setState(nextState);
    };
  }

  _onLayerOpen (name) {
    this.setState({layer: name});
  }

  _onLayerClose () {
    this.setState({layer: undefined});
  }

  _onSizeTileSelect (selectedIndex) {
    let template = { ...this.state.template };
    let errors = { ...this.state.errors };
    template.size = this.state.sizes[selectedIndex];
    delete errors.size;
    this.setState({ template: template, errors: errors });
  }

  _onSizeSearch (event) {
    const sizeSearchText = event.target.value;
    const regexp = new RegExp(sizeSearchText, 'i');
    const sizes = this.props.sizes.filter(size => size.name.match(regexp));
    this.setState({ sizes: sizes });
  }

  _onSizeSuggestionSelect (pseudoEvent) {
    let template = { ...this.state.template };
    let errors = { ...this.state.errors };
    template.size = pseudoEvent.option.size;
    delete errors.size;
    this.setState({
      errors: errors,
      sizes: this.props.sizes,
      template: template
    });
  }

  _onImageSearch (event) {
    const imageSearchText = event.target.value;
    let template = { ...this.state.template };
    template.image = {};
    this.setState({ imageSearchText: imageSearchText, template: template });
    this.props.dispatch(loadVmImages(imageSearchText));
  }

  _onImageSelect (pseudoEvent) {
    let template = { ...this.state.template };
    let errors = { ...this.state.errors };
    template.image = pseudoEvent.option;
    delete errors.image;
    this.setState({
      errors: errors,
      imageSearchText: undefined,
      template: template
    });
  }

  _onNetworkEdit (index) {
    this.setState({ editNetworkIndex: index, layer: 'network' });
  }

  _onNetworkAdd () {
    this.setState({ addNetwork: true, layer: 'network' });
  }

  _onNetworkRemove () {
    let template = { ...this.state.template };
    template.networks.splice(this.state.editNetworkIndex, 1);
    this.setState({
      editNetworkIndex: -1,
      layer: undefined,
      template: template
    });
    this.props.dispatch(changeVm(vm));
  }

  _onNetworkChange (network) {
    let template = { ...this.state.template };
    let networks = template.networks.splice(0);
    if (this.state.addNetwork) {
      networks.push(network);
    } else {
      networks[this.state.editNetworkIndex] = network;
    }
    template.networks = networks;
    this.setState({
      addNetwork: false,
      editNetworkIndex: -1,
      layer: undefined,
      template: template
    });
  }

  _renderCountField () {
    const { count } = this.state;
    return (
      <FormField label="Virtual machines" key="count" htmlFor="count">
        <NumberInput id="count" name="count" min={1} max={16}
          value={count} onChange={this._change(null, 'count')} />
      </FormField>
    );
  }

  _renderNameFields () {
    const { count, naming, template, errors } = this.state;
    let nameFields;
    if (1 === count) {

      nameFields = (
        <FormField label="Name" htmlFor="name" error={errors.name}>
          <input id="name" name={"template.name"} type="text"
            value={template.name || ''}
            onChange={this._change('template', 'name')} />
        </FormField>
      );

    } else if (count > 1) {

      nameFields = [
        <FormField key="type" label="Name">
          <RadioButton id="nameStrategyPrefix" name="naming.type"
            label="Add a name prefix"
            value="prefix"
            checked={'prefix' === naming.type}
            onChange={this._change('naming', 'type')}/>
          <RadioButton id="nameStrategyManual" name="naming.type"
            label="Provide each individual name"
            value="manual"
            checked={'manual' === naming.type}
            onChange={this._change('naming', 'type')}/>
          <RadioButton id="nameStrategyExtend" name="naming.type"
            label="Extend an existing set of virtual machines"
            value="extend"
            checked={'extend' === naming.type}
            onChange={this._change('naming', 'type')}/>
        </FormField>
      ];

      switch (naming.type) {

        case 'prefix':
          nameFields.push(
            <FormFields key="prefix">
              <FormField label="Prefix" htmlFor="namePrefix">
                <input id="namePrefix" name="naming.prefix" type="text"
                  value={naming.prefix}
                  onChange={this._change('naming', 'prefix')} />
              </FormField>
              <FormField label="Start numbering with" htmlFor="nameStart">
                <input id="nameStart" name="naming.start" type="number"
                  value={naming.start}
                  onChange={this._change('naming', 'prefix')} />
              </FormField>
            </FormFields>
          );
          break;

        case 'manual':
          for (let i = 0; i < count; i += 1) {
            nameFields.push(
              <FormField key={i} label={'Virtual machine ' + (i + 1)}
                htmlFor={'vm' + i}>
                <input id={'vm' + i} name={"naming.names." + i} type="text"
                  value={naming.names[i]}
                  onChange={this._change('naming', 'names', i)} />
              </FormField>
            );
          }
          break;

        case 'extend':
          nameFields.push(
            <FormField key="extend" label="Existing virtual machine"
              htmlFor="namingExtend">
              <Select id="namingExtend" name="naming.extend"
                value={naming.extend} options={undefined}
                onChange={this._change('naming', 'extend')}
                onSearch={this._onNameExtendSearch} />
            </FormField>
          );
          break;
      }
    }
    return nameFields;
  }

  _renderSizeTiles () {
    const { sizes, template, errors } = this.state;
    let selectedIndex;
    const sizeTiles = sizes.map((size, index) => {
      if (size.name === template.size.name) {
        selectedIndex = index;
      }
      return (
        <SizeTile key={size.name} item={size} editable={false} />
      );
    });
    let error;
    if (errors.size) {
      error = <span className="error">required</span>;
    }

    return (
      <fieldset>
        <Box direction="row" justify="between">
          <Heading tag="h3">Size</Heading>
          {error}
        </Box>
        <Tiles selectable={true} fill={true} flush={true}
          selected={selectedIndex} onSelect={this._onSizeTileSelect}>
          {sizeTiles}
        </Tiles>
      </fieldset>
    );
  }

  _renderSizeInput () {
    const { sizes, template, errors } = this.state;
    const options = sizes.map(size => ({
      size: size,
      label: <SizeSuggestion size={size} />
    }));
    return (
      <fieldset>
        <Box direction="row" justify="between">
          <Heading tag="h3">Size</Heading>
        </Box>
        <FormField label="Size" htmlFor="size" error={errors.size}>
          <Select id="size" name="size"
            value={template.size.name} options={options}
            onChange={this._onSizeSuggestionSelect}
            onSearch={this._onSizeSearch} />
        </FormField>
      </fieldset>
    );
  }

  _renderSizeFields () {
    const { maxSizes } = this.state;
    if (maxSizes > 6) {
      return this._renderSizeInput();
    } else {
      return this._renderSizeTiles();
    }
  }

  _renderImageField () {
    const { template, errors } = this.state;
    const { images } = this.props;
    return (
      <fieldset>
        <Heading tag="h3">Initial Disk Image</Heading>
        <FormField label="Image" htmlFor="image" error={errors.image}>
          <Select id="image" name="image"
            value={template.image.name || ''} options={images}
            onChange={this._onImageSelect}
            onSearch={this._onImageSearch} />
        </FormField>
      </fieldset>
    );
  }

  _renderNetworkFields () {
    const { template } = this.state;
    const networks = template.networks.map((network, index) => {
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
            a11yTitle='Add Network' />
        </Header>
        <List>
          {networks}
        </List>
      </fieldset>
    );
  }

  _renderLayer () {
    const { addNetwork, editNetworkIndex, layer, template } = this.state;
    let result;
    if (layer) {
      if ('network' === layer) {
        let network = (addNetwork ? { dhcp: true } :
          template.networks[editNetworkIndex]);
        let heading = (addNetwork ? 'Add Network' : 'Edit Network');
        let onRemove = (addNetwork ? undefined : this._onNetworkRemove);
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

    const countField = this._renderCountField();
    const nameFields = this._renderNameFields();
    const sizeFields = this._renderSizeFields();
    const imageField = this._renderImageField();
    const networkFields = this._renderNetworkFields();

    let layer = this._renderLayer();

    return (
      <Article align="center" pad={{horizontal: 'medium'}} primary={true}>
        <Form onSubmit={this._onSubmit}>

          <Header size="large" justify="between" pad="none">
            <Heading tag="h2" margin="none" strong={true}>
              Add Virtual Machine
            </Heading>
            <Anchor icon={<CloseIcon />} path="/virtual-machines"
              a11yTitle='Close Add Virtual Machine Form' />
          </Header>

          <FormFields>

            <fieldset>
              {countField}
              {nameFields}
            </fieldset>

            {sizeFields}
            {imageField}
            {networkFields}

          </FormFields>

          <Footer pad={{vertical: 'medium'}}>
            <span />
            <Button type="submit" primary={true} label="Add"
              onClick={this._onSubmit} />
          </Footer>
        </Form>
        {layer}
      </Article>
    );
  }
}

VirtualMachineAdd.propTypes = {
  adding: PropTypes.bool.isRequired,
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  sizes: PropTypes.arrayOf(PropTypes.object).isRequired
};

VirtualMachineAdd.contextTypes = {
  router: PropTypes.object
};

let select = (state) => {
  return {
    adding: state.vm.adding || state.item.changing,
    images: state.vm.images,
    sizes: state.vm.sizes
  };
};

export default connect(select)(VirtualMachineAdd);
