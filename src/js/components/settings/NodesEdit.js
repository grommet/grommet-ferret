// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { changeNodesSettings } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import FormField from 'grommet/components/FormField';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Paragraph from 'grommet/components/Paragraph';
import CheckBox from 'grommet/components/CheckBox';
import ErrorList from './ErrorList';

const Field = (props) => {
  const { errors, index, label, onChange, property, type, value } = props;
  return (
    <FormField htmlFor={`${property}-${index}`}
      label={label} error={errors[property]}>
      <input id={`${property}-${index}`} name={`${property}-${index}`}
        type={type || 'text'} value={value} onChange={onChange} />
    </FormField>
  );
};

class NodesEdit extends Component {

  constructor (props) {
    super(props);

    this._onSubmit = this._onSubmit.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onToggle = this._onToggle.bind(this);

    this.state = {
      nodes: props.nodes.map(node => ({ ...node, manage: true })),
      commonUserName: props.commonUserName,
      commonPassword: props.commonPassword,
      errors: { nodes: {} }
    };
  }

  _onSubmit () {
    let errors = { nodes: [] };
    let noErrors = true;

    this.state.nodes.forEach((node, index) => {
      if (! node.address) {
        if (! errors.nodes[index]) {
          errors.nodes[index] = {};
        }
        errors.nodes[index].address = 'required';
        noErrors = false;
      }
    });

    let commonCredentialNodes = this.state.nodes.filter((node, index) => {
      if (node.manage && ! node.managed) {
        if (false === node.useCommonCredentials) {
          if (! errors.nodes[index]) {
            errors.nodes[index] = {};
          }
          if (! node.userName) {
            errors.nodes[index].userName = 'required';
            noErrors = false;
          }
          if (! node.password) {
            errors.nodes[index].password = 'required';
            noErrors = false;
          }
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    });

    if (commonCredentialNodes.length > 0) {
      if (! this.state.commonUserName) {
        errors.commonUserName = 'required';
        noErrors = false;
      }
      if (! this.state.commonPassword) {
        errors.commonPassword = 'required';
        noErrors = false;
      }
    }

    if (noErrors) {
      this.props.dispatch(changeNodesSettings(this.state.nodes,
        this.state.commonUserName, this.state.commonPassword));
      this.props.onClose();
    } else {
      this.setState({errors: errors});
    }
  }

  _onChange (event) {
    const attribute = event.target.getAttribute('name');
    const value = event.target.value;
    let parts = attribute.split('-');
    if (parts.length === 1) {
      let state = {errors: this.state.errors};
      state[attribute] = value;
      delete state.errors[attribute];
      this.setState(state);
    } else {
      let index = parseInt(parts[1], 10);
      var nodes = this.state.nodes;
      while (nodes.length <= index) {
        nodes.push({});
      }
      var node = nodes[index];
      node[parts[0]] = value;
      this.setState({nodes: nodes});
    }
  }

  _onToggle (index, property) {
    let nodes = this.state.nodes;
    nodes[index][property] = ! nodes[index][property];
    this.setState({ nodes: nodes });
  }

  _renderCredentialFields () {
    const errors = this.state.errors;
    return (
      <fieldset>
        <Heading tag="h3">Common credentials</Heading>
        <Field label="iLO user name" property="commonUserName"
          value={this.state.commonUserName} errors={errors}
          onChange={this._onChange} />
        <Field label="iLO password" property="commonPassword"
          value={this.state.commonPassword} errors={errors}
          onChange={this._onChange} />
      </fieldset>
    );
  }

  _renderNodeFields (node, index) {
    const { nodes } = this.state;
    const errors = this.state.errors.nodes[index] || {};

    let addressField;
    let credentialsControl;
    let credentials;

    if (node.manage && ! this.props.nodes[index].managed) {
      addressField = (
        <FormField htmlFor={`address-${index}`} label="iLO IP address"
          error={errors.address}>
          <input id={`address-${index}`} name={`address-${index}`}
            type="text"
            value={node.address} onChange={this._onChange} />
        </FormField>
      );

      if (nodes.length > 1) {
        credentialsControl = (
          <FormField htmlFor={`common-${index}`}>
            <CheckBox id={`common-${index}`} name={`common-${index}`}
              label="Use common credentials"
              checked={false !== node.useCommonCredentials}
              onChange={this._onToggle.bind(this,
                index, 'useCommonCredentials')} />
          </FormField>
        );
      }

      if (nodes.length === 1 || false === node.useCommonCredentials) {
        credentials = [
          <Field key='name' label="iLO user name" property="userName"
            value={node.userName} errors={errors}
            onChange={this._onChange} />,
          <Field key='password' label="iLO password" property="password"
            value={node.password} errors={errors}
            onChange={this._onChange} />
        ];
      }
    }

    return (
      <fieldset key={index}>
        <Header tag="h2">{node.name}</Header>
        <span className="secondary">{node.serialNumber}</span>
        <FormField htmlFor={`manage-${index}`}>
          <CheckBox id={`manage-${index}`} name={`manage-${index}`}
            label="Manage"
            checked={false !== node.manage}
            onChange={this._onToggle.bind(this, index, 'manage')} />
        </FormField>
        {addressField}
        {credentialsControl}
        {credentials}
      </fieldset>
    );
  }

  render () {
    const { productName, settings } = this.props;
    const { nodes } = this.state;
    const unmanagedNodes = this.state.nodes.filter(node => ! node.managed);

    let credentialFields;
    if (nodes.length > 1 && unmanagedNodes.length > 0) {
      credentialFields = this._renderCredentialFields();
    }
    const nodeFields = nodes.map((node, index) => {
      return this._renderNodeFields(node, index);
    });
    let nodesErrors;
    if (settings.errors && settings.errors.nodes) {
      nodesErrors = <ErrorList errors={settings.errors.nodes} />;
    }

    return (
      <LayerForm title="Nodes" submitLabel="OK"
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <Paragraph>This {productName} needs to know which existing iLO IP
          addresses to associate with each hypervisor host in order to manage
          them. Managing nodes includes monitoring alerts and upgrading
          firmware.</Paragraph>
        {credentialFields}
        {nodesErrors}
        {nodeFields}
      </LayerForm>
    );
  }
}

NodesEdit.propTypes = {
  commonPassword: PropTypes.string,
  commonUserName: PropTypes.string,
  onClose: PropTypes.func,
  productName: PropTypes.string,
  nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
  settings: PropTypes.object.isRequired
};

let select = (state) => ({
  commonPassword: state.settings.settings.nodesCommonPassword,
  commonUserName: state.settings.settings.nodesCommonUserName,
  productName: state.settings.productName.short,
  nodes: state.settings.settings.nodes,
  settings: state.settings.settings
});

export default connect(select)(NodesEdit);
