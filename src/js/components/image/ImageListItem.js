// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ListItem from 'grommet/components/ListItem';
import Anchor from 'grommet/components/Anchor';
import EditIcon from 'grommet/components/icons/base/Edit';

class ImageListItem extends Component {

  render() {
    let { item, index, role } = this.props;
    let edit;
    if ('read only' !== role) {
      edit = (
        <Anchor icon={<EditIcon />} path={`/images/edit${item.uri}`}
          a11yTitle={`Edit ${item.name} Image`} />
      );
    }

    return (
      <ListItem direction="row" align="center" justify="between"
        separator={index === 0 ? 'horizontal' : 'bottom'}
        pad={{horizontal: 'medium', vertical: 'small', between: 'medium'}}
        responsive={false}
        onClick={this.props.onClick} selected={this.props.selected}>
        <span>{item.name}</span>
        {edit}
      </ListItem>
    );
  }
}

ImageListItem.propTypes = {
  index: PropTypes.number,
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool
};

let select = (state) => {
  return {
    role: state.session.role
  };
};

export default connect(select)(ImageListItem);
