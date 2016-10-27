// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import Anchor from 'grommet/components/Anchor';

export default class ActivityResourceLink extends Component {

  render() {
    const { item } = this.props;

    let result;
    if ('appliances' === item.attributes.associatedResourceCategory) {
      // url = '/settings/edit';
      // name = 'Settings';
      result = <span />;
    } else {
      let url;
      if ('virtual-machines' === item.attributes.associatedResourceCategory) {
        url = '/' + item.attributes.associatedResourceCategory +
          item.attributes.associatedResourceUri;
      } else {
        url = '/' + item.attributes.associatedResourceCategory;
      }
      let name = item.attributes.associatedResourceName;
      result = (
        <Anchor path={url}>
          <strong>{name}</strong>
        </Anchor>
      );
    }
    return result;
  }
}

ActivityResourceLink.propTypes = {
  item: PropTypes.object.isRequired // alert or task index item
};
