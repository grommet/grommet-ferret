// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadItem, updateItem, unloadItem } from '../../actions/actions';
import SizeForm from './SizeForm';

class SizeEdit extends Component {

  constructor () {
    super();
    this._onSubmit = this._onSubmit.bind(this);
  }

  componentDidMount () {
    this.props.dispatch(loadItem(this.props.uri, false));
  }

  componentWillUnmount () {
    this.props.dispatch(unloadItem(this.props.size, false));
  }

  _onSubmit (size) {
    const { router } = this.context;
    this.props.dispatch(updateItem(size));
    router.push({
      pathname: '/virtual-machine-sizes',
      search: document.location.search
    });
  }

  render () {
    return (
      <SizeForm heading="Edit Size" submitLabel="OK"
        size={this.props.size} onSubmit={this._onSubmit}
        removable={true} />
    );
  }
}

SizeEdit.propTypes = {
  size: PropTypes.object,
  uri: PropTypes.string
};

SizeEdit.contextTypes = {
  router: PropTypes.object
};

let select = (state, props) => {
  return {
    size: state.item.item || {},
    uri: '/' + props.params.splat
  };
};

export default connect(select)(SizeEdit);
