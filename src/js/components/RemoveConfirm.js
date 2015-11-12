// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { itemRemove } from '../actions';
import Layer from 'grommet/components/Layer';
import Form from 'grommet/components/Form';
import FormFields from 'grommet/components/FormFields';
import Header from 'grommet/components/Header';
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import Button from 'grommet/components/Button';

class RemoveConfirm extends Component {

  constructor() {
    super();
    this._onRemove = this._onRemove.bind(this);
  }

  _onRemove() {
    this.props.onClose();
    this.props.dispatch(itemRemove(this.props.category, this.props.item));
  }

  render() {
    let item = this.props.item.item;
    return (
      <Layer align="right" closer={true} onClose={this.props.onClose}>
        <Form onSubmit={this._onRemove} compact={true}>
          <Header>
            <h1>Remove {item.name}</h1>
          </Header>
          <FormFields>
            <fieldset>
              <p>Are you sure you want to remove {item.name}?</p>
            </fieldset>
          </FormFields>
          <Footer pad={{vertical: 'medium'}}>
            <Menu>
              <Button label="Yes, Remove" primary={true} strong={true}
                onClick={this._onRemove} />
            </Menu>
          </Footer>
        </Form>
      </Layer>
    );
  }
}

RemoveConfirm.propTypes = {
  category: PropTypes.string.isRequired,
  item: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  uri: PropTypes.string.isRequired
};

export default connect()(RemoveConfirm);
