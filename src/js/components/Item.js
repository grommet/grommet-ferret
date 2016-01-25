// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { itemLoad, itemUnload, itemEdit } from '../actions';
import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import CloseIcon from 'grommet/components/icons/base/Close';
import Article from 'grommet/components/Article';
import StatusIcon from 'grommet/components/icons/Status';
import Notification from 'grommet/components/Notification';
import RemoveConfirm from './RemoveConfirm';

class Item extends Component {

  constructor() {
    super();
    this._onEdit = this._onEdit.bind(this);
    this._onRemoveOpen = this._onRemoveOpen.bind(this);
    this._onRemoveClose = this._onRemoveClose.bind(this);
    this.state = {removing: false};
  }

  componentDidMount() {
    this.props.dispatch(itemLoad(this.props.uri));
  }

  componentWillReceiveProps(newProps) {
    if (this.props.uri !== newProps.uri) {
      this.props.dispatch(itemUnload(this.props.item));
      this.props.dispatch(itemLoad(newProps.uri));
    }
    if (newProps.item.item) {
      clearTimeout(this._lastItemTimer);
      this.setState({lastItem: newProps.item.item});
    } else {
      // We hold on to the last item for a bit to reduce content flashing
      // when the user clicks between items.
      clearTimeout(this._lastItemTimer);
      this._lastItemTimer = setTimeout(function () {
        this.setState({lastItem: null});
      }.bind(this), 200);
    }
  }

  componentWillUnmount() {
    this.props.dispatch(itemUnload(this.props.item));
  }

  _onEdit() {
    this.props.dispatch(itemEdit(this.props.category, this.props.item));
  }

  _onRemoveOpen() {
    this.setState({removing: true});
  }

  _onRemoveClose() {
    this.setState({removing: false});
  }

  render() {
    let item = this.props.item.item || this.state.lastItem || {};
    let name;
    let removeConfirm;
    let notifications;

    name = item.name || this.props.item.name;

    if (this.state.removing) {
      removeConfirm = (
        <RemoveConfirm category={this.props.category}
          item={this.props.item}
          uri={this.props.uri}
          onClose={this._onRemoveClose} />
      );
    }

    if (this.props.item.notifications.items) {
      notifications = this.props.item.notifications.items.map((notification) => {
        return (
          <Notification key={notification.uri}
            flush={false}
            pad={{vertical: 'large', horizontal: 'medium'}}
            status={notification.status}
            message={notification.name}
            state={notification.state}
            timestamp={new Date(notification.created)} />
        );
      });
    }

    let actions;
    if (this.props.item.editable) {
      actions = [
        <Anchor key="edit" onClick={this._onEdit}>Edit</Anchor>,
        <Anchor key="remove" onClick={this._onRemoveOpen}>Remove</Anchor>
      ];
    }
    let menu = (
      <Menu inline={false} label="menu">
        <Link to={this.props.detailsPath}><Anchor tag="span">Details</Anchor></Link>
        {actions}
      </Menu>
    );

    return (
      <div>
        <Header large={true} justify="between" fixed={true} pad={{horizontal: "medium"}}>
          {menu}
          <Menu>
            <Link to={this.props.closePath}>
              <CloseIcon />
            </Link>
          </Menu>
        </Header>
        <Article>
          <Header large={true} tag="h1" pad={{horizontal: 'medium'}}>
            <StatusIcon value={item.status} large={true} />
            {name}
          </Header>
          {notifications}
          {this.props.children}
        </Article>
        {removeConfirm}
      </div>
    );
  }
}

Item.propTypes = {
  category: PropTypes.string.isRequired,
  closePath: PropTypes.string.isRequired,
  detailsPath: PropTypes.string.isRequired,
  item: PropTypes.object,
  uri: PropTypes.string.isRequired,
  watcher: PropTypes.any
};

let select = (state, props) => {
  const category = state.route.pathname.split('/')[1];
  const uri = '/' + (props.uri || props.params.splat);
  return {
    category: category,
    uri: uri,
    closePath: '/' + category + document.location.search,
    detailsPath: '/' + category + '/details' + uri + document.location.search,
    item: state.item
  };
};

export default connect(select)(Item);
