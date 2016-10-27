// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadItem, unloadItem, updateImage } from '../../actions/actions';
import ImageForm from './ImageForm';

class ImageEdit extends Component {

  constructor () {
    super();
    this._onSubmit = this._onSubmit.bind(this);
  }

  componentDidMount () {
    this.props.dispatch(loadItem(this.props.uri, false));
  }

  componentWillUnmount () {
    this.props.dispatch(unloadItem(this.props.image, false));
  }

  _onSubmit (image, file) {
    const { router } = this.context;
    this.props.dispatch(updateImage(image, file));
    router.push({
      pathname: '/images',
      search: document.location.search
    });
  }

  render () {
    return (
      <ImageForm heading="Edit Image" submitLabel="OK"
        image={this.props.image} onSubmit={this._onSubmit}
        removable={true}
        busyMessage={this.props.changing ? 'Updating' : null} />
    );
  }
}

ImageEdit.propTypes = {
  changing: PropTypes.bool.isRequired,
  image: PropTypes.object,
  uri: PropTypes.string
};

ImageEdit.contextTypes = {
  router: PropTypes.object
};

let select = (state, props) => {
  return {
    changing: state.item.changing,
    image: state.item.item || {},
    uri: '/' + props.params.splat
  };
};

export default connect(select)(ImageEdit);
