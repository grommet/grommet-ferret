// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { addImage } from '../../actions/actions';
import ImageForm from './ImageForm';

const DEFAULT_IMAGE = {
  category: "images",
  name: ''
};

class ImageAdd extends Component {

  constructor () {
    super();
    this._onSubmit = this._onSubmit.bind(this);
  }

  _onSubmit (image, file) {
    const { router } = this.context;
    this.props.dispatch(addImage(image, file));
    router.push({
      pathname: '/images',
      search: document.location.search
    });
  }

  render () {
    return (
      <ImageForm heading="Add Image" submitLabel="Add"
        image={DEFAULT_IMAGE} onSubmit={this._onSubmit}
        busyMessage={this.props.changing ? 'Adding' : null} />
    );
  }
}

ImageAdd.propTypes = {
  changing: PropTypes.bool.isRequired
};

ImageAdd.contextTypes = {
  router: PropTypes.object
};

let select = (state, props) => {
  return {
    changing: state.item.changing
  };
};

export default connect(select)(ImageAdd);
