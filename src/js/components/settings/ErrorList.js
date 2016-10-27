// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';

export default class ErrorList extends Component {

  render () {
    const { errors } = this.props;

    const messages = errors.map((error, index) => (
      <ListItem key={index} direction="column" align="start" separator="none"
        pad={{vertical: 'small'}}>
        <div>{error.message}</div>
        <div><strong>Resolution</strong> {error.resolution}</div>
      </ListItem>
    ));
    return (
      <List className="error">
        {messages}
      </List>
    );
  }
}

ErrorList.propTypes = {
  errors: PropTypes.array.isRequired
};
