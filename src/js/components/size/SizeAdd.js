// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { addItem } from '../../actions/actions';
import SizeForm from './SizeForm';

const DEFAULT_SIZE = {
  category: "virtual-machine-sizes",
  name: '',
  vCpus: 2,
  memory: 4,
  diskSpace: 100
};

class SizeAdd extends Component {

  constructor () {
    super();
    this._onSubmit = this._onSubmit.bind(this);
  }

  _onSubmit (size) {
    const { router } = this.context;
    this.props.dispatch(addItem(size));
    router.push({
      pathname: '/virtual-machine-sizes',
      search: document.location.search
    });
  }

  render () {
    return (
      <SizeForm heading="Add Size" submitLabel="Add"
        size={DEFAULT_SIZE} onSubmit={this._onSubmit} />
    );
  }
}

SizeAdd.contextTypes = {
  router: PropTypes.object
};

export default connect()(SizeAdd);
