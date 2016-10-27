// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { removeItem } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import Paragraph from 'grommet/components/Paragraph';

class ImageRemove extends Component {

  constructor () {
    super();
    this._onRemove = this._onRemove.bind(this);
  }

  _onRemove () {
    const { router } = this.context;
    this.props.dispatch(removeItem(this.props.image.category,
      this.props.image.uri));
    router.push({
      pathname: '/images',
      search: document.location.search
    });
  }

  render () {
    let image = this.props.image;
    return (
      <LayerForm title="Remove Image" submitLabel="Yes, Remove"
        compact={true}
        onClose={this.props.onClose} onSubmit={this._onRemove}>
        <fieldset>
          <Paragraph>Are you sure you want to remove {image.name}?</Paragraph>
        </fieldset>
      </LayerForm>
    );
  }
}

ImageRemove.propTypes = {
  onClose: PropTypes.func.isRequired,
  image: PropTypes.object.isRequired
};

ImageRemove.contextTypes = {
  router: PropTypes.object
};

export default connect()(ImageRemove);
