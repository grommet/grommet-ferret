// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { changeHypervisor, loadHypervisorCertificate,
  verifyHypervisor, changeSettings } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import Paragraph from 'grommet/components/Paragraph';
import FormField from 'grommet/components/FormField';
import Certificate from '../Certificate';
import ErrorList from './ErrorList';

class HypervisorEdit extends Component {

  constructor () {
    super();

    this._onSubmit = this._onSubmit.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onTrust = this._onTrust.bind(this);
    this._onDontTrust = this._onDontTrust.bind(this);

    this.state = { errors: {}, busy: undefined };
  }

  componentWillReceiveProps (nextProps) {
    const { hypervisor } = nextProps;
    if (hypervisor.certificate && 'Connecting' === this.state.busy) {
      this.setState({ busy: undefined });
    }
    if (hypervisor.verified) {
      this.setState({ busy: undefined });
      this.props.dispatch(changeSettings({hypervisor: hypervisor}));
      this.props.onClose();
    }
  }

  _onSubmit () {
    let hypervisor = {...this.props.hypervisor};
    if (hypervisor.address && ! hypervisor.certificate) {
      this.setState({ busy: 'Connecting' });
      this.props.dispatch(loadHypervisorCertificate(hypervisor));
    } else {
      let errors = {...this.state.errors};
      let noErrors = true;
      if (! hypervisor.userName) {
        errors.userName = 'required';
        noErrors = false;
      }
      if (! hypervisor.password) {
        errors.password = 'required';
        noErrors = false;
      }
      if (noErrors) {
        if (! hypervisor.verified) {
          this.setState({ busy: 'Verifying' });
          this.props.dispatch(verifyHypervisor(hypervisor));
        } else {
          this.props.dispatch(changeSettings({hypervisor: hypervisor}));
          this.props.onClose();
        }
      } else {
        this.setState({ errors: errors });
      }
    }
  }

  _onChange (event) {
    let hypervisor = {...this.props.hypervisor};
    let errors = { ...this.state.errors };
    const attribute = event.target.getAttribute('name');
    hypervisor[attribute] = event.target.value;
    hypervisor.error = undefined;
    delete errors[attribute];
    this.setState({ errors: errors });
    this.props.dispatch(changeHypervisor(hypervisor));
  }

  _onTrust () {
    var hypervisor = {...this.props.hypervisor};
    hypervisor.trust = true;
    delete hypervisor.certificate;
    this.props.dispatch(changeHypervisor(hypervisor));
  }

  _onDontTrust () {
    this.props.onClose();
  }

  _renderCertificate (certificate) {
    return (
      <Certificate certificate={certificate}
        onTrust={this._onTrust} onDontTrust={this._onDontTrust} />
    );
  }

  _renderForm () {
    const { hypervisor, productName, settings } = this.props;
    let errors = this.state.errors;
    let submitLabel = 'Connect';

    let hypervisorErrors;
    if (settings.errors && settings.errors.hypervisor) {
      hypervisorErrors = <ErrorList errors={settings.errors.hypervisor} />;
    }

    let credentialFields;
    if (hypervisor.address && hypervisor.trust) {
      credentialFields = [
        <FormField key="userName" htmlFor="userName" label="User name"
          error={errors.userName}>
          <input id="userName" name="userName" type="text"
            value={hypervisor.userName} onChange={this._onChange} />
        </FormField>,
        <FormField key="password" htmlFor="password" label="Password"
          error={errors.password}>
          <input id="password" name="password" type="password"
            value={hypervisor.password} onChange={this._onChange} />
        </FormField>
      ];
      submitLabel = 'OK';
    }

    let error;
    if (hypervisor.error) {
      error = <span className="error">{hypervisor.error.message}</span>;
    }

    return (
      <LayerForm title="vCenter Access" submitLabel={submitLabel}
        busy={this.state.busy}
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <Paragraph>Your {productName} needs ongoing authenticed access to the
          vCenter.
          These credentials will be persisted in an encrypted form.
        </Paragraph>
        <fieldset>
          {hypervisorErrors}
          <FormField htmlFor="address" label="vCenter host name or IP address"
            error={errors.address}>
            <input id="address" name="address" type="text"
              value={hypervisor.address} onChange={this._onChange} />
          </FormField>
          {credentialFields}
        </fieldset>
        {error}
      </LayerForm>
    );
  }

  render () {
    const { hypervisor } = this.props;
    let result;
    if (hypervisor.certificate && ! hypervisor.trust) {
      result = this._renderCertificate(hypervisor.certificate);
    } else {
      result = this._renderForm();
    }
    return result;
  }
}

HypervisorEdit.propTypes = {
  onClose: PropTypes.func,
  productName: PropTypes.string,
  hypervisor: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired
};

let select = (state) => ({
  hypervisor: state.hypervisor,
  productName: state.settings.productName.short,
  settings: state.settings.settings
});

export default connect(select)(HypervisorEdit);
