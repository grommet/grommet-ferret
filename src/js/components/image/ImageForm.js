// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadImageOsTypes } from '../../actions/actions';
import Article from 'grommet/components/Article';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Anchor from 'grommet/components/Anchor';
import Form from 'grommet/components/Form';
import Footer from 'grommet/components/Footer';
import FormFields from 'grommet/components/FormFields';
import FormField from 'grommet/components/FormField';
import Button from 'grommet/components/Button';
import Select from 'grommet/components/Select';
import CloseIcon from 'grommet/components/icons/base/Close';
import TrashIcon from 'grommet/components/icons/base/Trash';
import ImageRemove from './ImageRemove';

class ImageForm extends Component {

  constructor (props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onFileChange = this._onFileChange.bind(this);
    this._onOsTypeSearch = this._onOsTypeSearch.bind(this);
    this._onOsTypeChange = this._onOsTypeChange.bind(this);
    this._onRemoveOpen = this._onRemoveOpen.bind(this);
    this._onRemoveClose = this._onRemoveClose.bind(this);

    this.state = {
      errors: {},
      image: { ...props.image },
      removing: false
    };
  }

  componentDidMount () {
    this.props.dispatch(loadImageOsTypes());
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ image: {...nextProps.image} });
  }

  _onSubmit (event) {
    event.preventDefault();
    let errors = {};
    let noErrors = true;
    let file = this.refs.file.files[0];
    if (! file) {
      errors.file = 'required';
      noErrors = false;
    }
    if (noErrors) {
      this.props.onSubmit(this.state.image, file);
    } else {
      this.setState({ errors: errors });
    }
  }

  _onChange (event) {
    var image = { ...this.state.image };
    var errors = { ...this.state.errors };
    const attribute = event.target.getAttribute('name');
    const value = event.target.value;
    image[attribute] = value;
    delete errors[attribute];
    this.setState({ image: image, errors: errors });
  }

  _onFileChange () {
    let file = this.refs.file.files[0];
    let name = this.refs.name.value;
    if (! name) {
      if (file) {
        let image = { ...this.state.image };
        image.name = file.name;
        this.setState({ image: image });
      }
    }
    this.setState({ fileName: file.name });
  }

  _onOsTypeSearch (event) {
    const osTypeSearchText = event.target.value;
    this.props.dispatch(loadImageOsTypes(osTypeSearchText));
  }

  _onOsTypeChange (pseudoEvent) {
    let image = { ...this.state.image };
    image.osType = pseudoEvent.option;
    this.setState({ image: image });
  }

  _onRemoveOpen () {
    this.setState({removing: true});
  }

  _onRemoveClose () {
    this.setState({removing: false});
  }

  render () {
    let { image, fileName, errors } = this.state;
    const osType = image.osType || {};

    let osTypeField;
    if (fileName && fileName.slice(-3).toLowerCase() === 'iso') {
      osTypeField = (
        <FormField htmlFor="osType" label="Operating sytem type"
          error={errors.osType}>
          <Select id="osType" name="osType"
            value={osType}
            options={this.props.osTypes}
            onChange={this._onOsTypeChange}
            onSearch={this._onOsTypeSearch} />
        </FormField>
      );
    }

    let removeControl;
    if (this.props.removable) {
      removeControl = (
        <Button icon={<TrashIcon />} label="Remove" onClick={this._onRemoveOpen}
          a11yTitle={`Remove ${image.name} Image`} plain={true} />
      );
    }

    let removeConfirm;
    if (this.state.removing) {
      removeConfirm = (
        <ImageRemove image={image} onClose={this._onRemoveClose} />
      );
    }

    return (
      <Article align="center" pad={{horizontal: 'medium'}} primary={true}>
        <Form onSubmit={this._onSubmit}>

          <Header size="large" justify="between" pad="none">
            <Heading tag="h2" margin="none" strong={true}>
              {this.props.heading}
            </Heading>
            <Anchor path="/images" icon={<CloseIcon />}
              a11yTitle={`Close ${this.props.heading} Form`}/>
          </Header>

          <FormFields>
            <fieldset>
              <FormField htmlFor="name" label="Name" error={errors.name}
                help="If not specified, the file name will be used.">
                <input ref="name" id="name" name="name" type="text"
                  value={image.name || ''} onChange={this._onChange} />
              </FormField>
              <FormField label="File" htmlFor="file" error={errors.file}>
                <input ref="file" id="file" name="file" type="file"
                  onChange={this._onFileChange} />
              </FormField>
              {osTypeField}
            </fieldset>
          </FormFields>

          <Footer pad={{vertical: 'medium'}} justify="between">
            <Button type="submit" primary={true} label={this.props.submitLabel}
              onClick={this._onSubmit} />
            {removeControl}
          </Footer>
        </Form>

        {removeConfirm}
      </Article>
    );
  }
}

ImageForm.propTypes = {
  busyMessage: PropTypes.string,
  heading: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  removable: PropTypes.bool,
  image: PropTypes.object,
  submitLabel: PropTypes.string.isRequired,
  osTypes: PropTypes.arrayOf(PropTypes.object)
};

let select = (state, props) => {
  return {
    changing: state.item.changing,
    image: state.item.item,
    osTypes: state.image.osTypes
  };
};

export default connect(select)(ImageForm);
