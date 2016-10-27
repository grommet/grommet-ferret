// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import LayerForm from 'grommet-templates/components/LayerForm';
import Heading from 'grommet/components/Heading';
import Paragraph from 'grommet/components/Paragraph';
import Button from 'grommet/components/Button';

class Certificate extends Component {

  constructor () {
    super();
    this._onSubmit = this._onSubmit.bind(this);
  }

  _onSubmit () {
    this.props.onTrust();
  }

  render () {
    const certificate = this.props.certificate;
    const dontTrustControl =
      <Button label="Don't Trust" onClick={this.props.onDontTrust} />;

    return (
      <LayerForm title="Certificate" submitLabel="Trust"
        secondaryControl={dontTrustControl}
        onClose={this.props.onDontTrust} onSubmit={this._onSubmit}>
        <Heading tag="h3">{certificate.name}</Heading>
        <Paragraph>Issued by: {certificate.issuedBy}</Paragraph>
        <Paragraph>
          Expires: {(new Date(certificate.expires)).toLocaleString()}
        </Paragraph>
      </LayerForm>
    );
  }
}

Certificate.propTypes = {
  certificate: PropTypes.object.isRequired,
  onDontTrust: PropTypes.func.isRequired,
  onTrust: PropTypes.func.isRequired
};

export default Certificate;
