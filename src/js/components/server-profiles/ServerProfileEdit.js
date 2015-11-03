// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { itemLoad, itemUpdate } from '../../actions';
import Article from 'grommet/components/Article';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Menu from 'grommet/components/Menu';
import CloseIcon from 'grommet/components/icons/base/Close';
import ServerProfileForm from './ServerProfileForm';

class ServerProfileEdit extends Component {

  constructor() {
    super();
    this._onSubmit = this._onSubmit.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(itemLoad(this.props.uri));
  }

  _onSubmit(serverProfile) {
    this.props.dispatch(itemUpdate(serverProfile));
  }

  render() {
    var message;
    if (this.props.changing) {
      message = 'Adding';
    }

    return (
      <Article>
        <Header fixed={true} large={true} justify="between" pad={{horizontal: 'medium'}}>
          <Title>Edit Server Profile</Title>
          <Menu>
            <Link to={"/server-profiles/" + this.props.uri}><CloseIcon /></Link>
          </Menu>
        </Header>

        <ServerProfileForm serverProfile={this.props.serverProfile}
          onSubmit={this._onSubmit} buttonLabel="Update"
          processingMessage={message} />

      </Article>
    );
  }
}

ServerProfileEdit.propTypes = {
  changing: PropTypes.bool.isRequired,
  serverProfile: PropTypes.object.isRequired
};

let select = (state, props) => {
  return {
    changing: state.item.changing,
    serverProfile: state.item.item,
    uri: '/' + props.params.splat
  };
};

export default connect(select)(ServerProfileEdit);
