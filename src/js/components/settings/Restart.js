// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { restart } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import Paragraph from 'grommet/components/Paragraph';
import FormField from 'grommet/components/FormField';
import CheckBox from 'grommet/components/CheckBox';

class Restart extends Component {

  constructor () {
    super();
    this._onSubmit = this._onSubmit.bind(this);
    this._onChange = this._onChange.bind(this);

    this.state = {
      confirmed: false,
      errors: {}
    };
  }

  _onSubmit () {
    let errors = {};
    let noErrors = true;
    if (! this.state.confirmed) {
      errors.confirm = 'required';
      noErrors = false;
    }
    if (noErrors) {
      this.props.dispatch(restart());
    } else {
      this.setState({ errors: errors });
    }
  }

  _onChange (event) {
    this.setState({ confirmed: ! this.state.confirmed, errors: {} });
  }

  render () {
    const { productName } = this.props;

    return (
      <LayerForm title="Restart" submitLabel="Restart"
        compact={true}
        onClose={this.props.onClose} onSubmit={this._onSubmit}>
        <Paragraph>
          Restarting {productName} will cause it to be temporarily unavailable.
        </Paragraph>
        <Paragraph>
          For this prototype, restarting will discard all data and reset
          the management software to it's initial state. This means the
          initial setup will need to performed again.
        </Paragraph>
        <fieldset>
          <FormField htmlFor="confirm" error={this.state.errors.confirm}>
            <CheckBox id="confirm" name="confirm"
              label="Are you sure?"
              checked={this.state.confirmed} onChange={this._onChange} />
          </FormField>
        </fieldset>
      </LayerForm>
    );
  }
}

Restart.propTypes = {
  onClose: PropTypes.func,
  productName: PropTypes.string
};

let select = (state) => ({
  productName: state.settings.productName.short
});

export default connect(select)(Restart);
