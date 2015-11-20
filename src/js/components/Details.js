// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { itemLoad, itemUnload } from '../actions';
import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import CloseIcon from 'grommet/components/icons/base/Close';
import Article from 'grommet/components/Article';
import Grobject from 'grommet/components/Object';

class Details extends Component {

  componentDidMount() {
    this.props.dispatch(itemLoad(this.props.uri));
  }

  componentWillUnmount() {
    this.props.dispatch(itemUnload(this.props.item));
  }

  render() {
    let item = this.props.item.item;

    return (
      <div>
        <Header large={true} justify="between" fixed={true} pad={{horizontal: "medium"}}>
          <span>Details</span>
          <Menu>
            <Link to={this.props.closePath}>
              <CloseIcon />
            </Link>
          </Menu>
        </Header>
        <Article>
          <Grobject data={item} />
        </Article>
      </div>
    );
  }
}

Details.propTypes = {
  closePath: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired,
  uri: PropTypes.string.isRequired
};

let select = (state, props) => {
  const category = state.route.pathname.split('/')[1];
  const uri = '/' + props.params.splat;
  return {
    closePath: '/' + category + uri + document.location.search,
    item: state.item,
    uri: uri
  };
};

export default connect(select)(Details);
