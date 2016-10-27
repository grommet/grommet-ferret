// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { removeItem } from '../../actions/actions';
import LayerForm from 'grommet-templates/components/LayerForm';
import Paragraph from 'grommet/components/Paragraph';

class SizeRemove extends Component {

  constructor () {
    super();
    this._onRemove = this._onRemove.bind(this);
  }

  _onRemove () {
    const { router } = this.context;
    this.props.dispatch(removeItem(this.props.size.category,
      this.props.size.uri));
    router.push({
      pathname: '/virtual-machine-sizes',
      search: document.location.search
    });
  }

  render () {
    let size = this.props.size;
    return (
      <LayerForm title="Remove Size" submitLabel="Yes, Remove"
        compact={true}
        onClose={this.props.onClose} onSubmit={this._onRemove}>
        <fieldset>
          <Paragraph>Are you sure you want to remove {size.name}?</Paragraph>
        </fieldset>
      </LayerForm>
    );
  }
}

SizeRemove.propTypes = {
  onClose: PropTypes.func.isRequired,
  size: PropTypes.object.isRequired
};

SizeRemove.contextTypes = {
  router: PropTypes.object
};

export default connect()(SizeRemove);
