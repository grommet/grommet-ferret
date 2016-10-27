// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import Article from 'grommet/components/Article';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Form from 'grommet/components/Form';
import Footer from 'grommet/components/Footer';
import FormFields from 'grommet/components/FormFields';
import FormField from 'grommet/components/FormField';
import NumberInput from 'grommet/components/NumberInput';
import Button from 'grommet/components/Button';
import CloseIcon from 'grommet/components/icons/base/Close';
import TrashIcon from 'grommet/components/icons/base/Trash';
import SizeRemove from './SizeRemove';
import Anchor from 'grommet/components/Anchor';

const NUMERIC_RANGES = {
  "vCpus": [1, 128],
  "memory": [1, 1024],
  "diskSpace": [10, 62000]
};

class SizeForm extends Component {

  constructor (props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
    this._onRemoveOpen = this._onRemoveOpen.bind(this);
    this._onRemoveClose = this._onRemoveClose.bind(this);

    this.state = {
      errors: {},
      removing: false,
      size: props.size
    };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ size: nextProps.size });
  }

  _onSubmit (event) {
    event.preventDefault();
    let size = this.state.size;
    let errors = {};
    let noErrors = true;
    if (! size.name) {
      errors.name = 'required';
      noErrors = false;
    }
    if (noErrors) {
      this.props.onSubmit(size);
    } else {
      this.setState({ errors: errors });
    }
  }

  _change (propertyName) {
    return (event) => {
      let size = { ...this.state.size };
      let value = event.target.value;
      const range = NUMERIC_RANGES[propertyName];
      let errors = this.state.errors;
      if (range) {
        value = parseInt(value, 10);
        if (! value || value < range[0] || value > range[1]) {
          errors[propertyName] = `Must be between ${range[0]} and ${range[1]}`;
        } else {
          delete errors[propertyName];
        }
      }
      size[propertyName] = value;
      this.setState({ size: size, errors: errors });
    };
  }

  _onRemoveOpen () {
    this.setState({ removing: true });
  }

  _onRemoveClose () {
    this.setState({ removing: false });
  }

  render () {
    let { size, errors } = this.state;

    let removeControl;
    if (this.props.removable) {
      removeControl = (
        <Button plain={true} icon={<TrashIcon />} label="Remove"
          onClick={this._onRemoveOpen} a11yTitle={`Remove ${size.name} Size`} />
      );
    }

    let removeConfirm;
    if (this.state.removing) {
      removeConfirm = (
        <SizeRemove size={size} onClose={this._onRemoveClose} />
      );
    }

    return (
      <Article align="center" pad={{horizontal: 'medium'}} primary={true}>
        <Form onSubmit={this._onSubmit}>

          <Header size="large" justify="between" pad="none">
            <Heading tag="h2" margin="none" strong={true}>
              {this.props.heading}
            </Heading>
            <Anchor icon={<CloseIcon />} path="/virtual-machine-sizes"
              a11yTitle={`Close ${this.props.heading} Form`} />
          </Header>

          <FormFields>

            <fieldset>
              <FormField label="Name" htmlFor="name" error={errors.name}>
                <input id="name" name="name" type="text"
                  value={size.name || ''} onChange={this._change('name')} />
              </FormField>
              <FormField label="vCPUs" htmlFor="vCpus"
                error={errors.vCpus}>
                <NumberInput id="vCpus" name="vCpus" min={1} max={128}
                  value={size.vCpus || 0} onChange={this._change('vCpus')} />
              </FormField>
              <FormField label="Memory (GB)" htmlFor="memory"
                error={errors.memory}>
                <NumberInput id="memory" name="memory" min={1} max={1024}
                  value={size.memory || 0} onChange={this._change('memory')} />
              </FormField>
              <FormField label="Disk space (GB)" htmlFor="diskSpace"
                error={errors.diskSpace}>
                <NumberInput id="diskSpace" name="diskSpace"
                  min={10} step={10} max={62000}
                  value={size.diskSpace || 0}
                  onChange={this._change('diskSpace')} />
              </FormField>
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

SizeForm.propTypes = {
  busyMessage: PropTypes.string,
  heading: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  removable: PropTypes.bool,
  size: PropTypes.object,
  submitLabel: PropTypes.string.isRequired
};

export default SizeForm;
