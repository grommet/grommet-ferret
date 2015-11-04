// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { itemLoad, itemUnload, itemRemove, itemEdit } from '../actions';
import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import CloseIcon from 'grommet/components/icons/base/Close';
import Article from 'grommet/components/Article';
import StatusIcon from 'grommet/components/icons/Status';
import Grobject from 'grommet/components/Object';
import Layer from 'grommet/components/Layer';
import Form from 'grommet/components/Form';
import FormFields from 'grommet/components/FormFields';
import Footer from 'grommet/components/Footer';
import Button from 'grommet/components/Button';
import Notification from 'grommet/components/Notification';

class Item extends Component {

  constructor() {
    super();
    this._onEdit = this._onEdit.bind(this);
    this._onRemoveOpen = this._onRemoveOpen.bind(this);
    this._onRemoveClose = this._onRemoveClose.bind(this);
    this._onRemove = this._onRemove.bind(this);
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

  _onRemove() {
    this.setState({removing: false});
    this.props.dispatch(itemRemove(this.props.category, this.props.uri));
  }

  render() {
    let item = this.props.item.item;

    let removeConfirm;
    if (this.state.removing) {
      removeConfirm = (
        <Layer align="right" closer={true} onClose={this._onRemoveClose}>
          <Form onSubmit={this._onRemove} compact={true}>
            <Header>
              <h1>Remove {item.name}</h1>
            </Header>
            <FormFields>
              <fieldset>
                <p>Are you sure you want to remove {item.name}?</p>
              </fieldset>
            </FormFields>
            <Footer pad={{vertical: 'medium'}}>
              <Menu>
                <Button label="Yes, Remove" primary={true} strong={true}
                  onClick={this._onRemove} />
              </Menu>
            </Footer>
          </Form>
        </Layer>
      );
    }

    let notifications;
    if (this.props.item.notifications.items) {
      notifications = this.props.item.notifications.items.map((notification) => {
        return (
          <Notification key={notification.uri} flush={false}
            status={notification.status}
            message={notification.name}
            state={notification.state}
            timestamp={new Date(notification.created)} />
        );
      });
    }

    let actions = <span></span>;
    if (this.props.item.editable) {
      actions = (
        <Menu inline={false}>
          <Anchor onClick={this._onEdit}>Edit</Anchor>
          <Anchor onClick={this._onRemoveOpen}>Remove</Anchor>
        </Menu>
      );
    }

    return (
      <div>
        <Header large={true} justify="between" fixed={true} pad={{horizontal: "medium"}}>
          {actions}
          <Menu>
            <Link to={this.props.closePath}>
              <CloseIcon />
            </Link>
          </Menu>
        </Header>
        <Article>
          <Header tag="h1" pad={{horizontal: 'medium'}}>
            <StatusIcon value={item.status} large={true} />
            {item.name}
          </Header>
          {notifications}
          <Grobject data={item} />
        </Article>
        {removeConfirm}
      </div>
    );
  }
}

Item.propTypes = {
  category: PropTypes.string.isRequired,
  item: PropTypes.object,
  uri: PropTypes.string.isRequired,
  watcher: PropTypes.any
};

let select = (state, props) => {
  const category = state.route.pathname.split('/')[1];
  return {
    category: category,
    uri: '/' + props.params.splat,
    closePath: '/' + category + document.location.search,
    item: state.item
  };
};

export default connect(select)(Item);
