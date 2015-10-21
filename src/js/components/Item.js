// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { itemLoad, itemUnload } from '../actions';
import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import CloseIcon from 'grommet/components/icons/Clear';
import Article from 'grommet/components/Article';
import StatusIcon from 'grommet/components/icons/Status';
import Grobject from 'grommet/components/Object';

class Item extends Component {

  componentDidMount() {
    this.props.dispatch(itemLoad(this.props.uri));
  }

  componentWillReceiveProps(newProps) {
    if (this.props.uri !== newProps.uri) {
      this.props.dispatch(itemUnload(this.props.watcher));
      this.props.dispatch(itemLoad(newProps.uri));
    }
  }

  componentWillUnmount() {
    this.props.dispatch(itemUnload(this.props.watcher));
  }

  render() {
    let item = this.props.item;
    return (
      <div>
        <Header large={true} justify="between" fixed={true} pad={{horizontal: "medium"}}>
          <span></span>
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
          <Grobject data={item} />
        </Article>
      </div>
    );
  }
}

Item.propTypes = {
  result: PropTypes.object,
  category: PropTypes.string.isRequired,
  uri: PropTypes.string.isRequired,
  watcher: PropTypes.any
};

let select = (state, props) => {
  const category = state.route.pathname.split('/')[1];
  return {
    category: category,
    uri: '/' + props.params.splat,
    closePath: '/' + category + document.location.search,
    item: state.item.item,
    watcher: state.item.watcher
  };
};

export default connect(select)(Item);
