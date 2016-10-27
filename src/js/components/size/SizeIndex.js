// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadIndex, queryIndex, moreIndex, unloadIndex
  } from '../../actions/index';
import Box from 'grommet/components/Box';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Search from 'grommet/components/Search';
import Anchor from 'grommet/components/Anchor';
import Button from 'grommet/components/Button';
import AddIcon from 'grommet/components/icons/base/Add';
import Tiles from 'grommet/components/Tiles';
import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import Query from 'grommet-addons/utils/Query';
import NavControl from '../NavControl';
import Notifications from '../Notifications';
import SizeTile from './SizeTile';

class SizeIndex extends Component {

  constructor () {
    super();
    this._onSearch = this._onSearch.bind(this);
    this._onMore = this._onMore.bind(this);
    this.state = { searchText: '' };
  }

  componentDidMount () {
    this.props.dispatch(loadIndex({
      category: 'virtual-machine-sizes', sort: 'vCpus:asc'
    }));
  }

  componentWillUnmount () {
    this.props.dispatch(unloadIndex());
  }

  _onSearch (event) {
    const { index } = this.props;
    const searchText = event.target.value;
    this.setState({ searchText });
    const query = new Query(searchText);
    this.props.dispatch(queryIndex(index, query));
  }

  _onMore () {
    const { index } = this.props;
    this.props.dispatch(moreIndex(index));
  }

  render () {
    const { index, role } = this.props;
    const { searchText } = this.state;
    const result = index.result || {};

    let addControl;
    if ('read only' !== role) {
      addControl = (
        <Anchor icon={<AddIcon />} path='/virtual-machine-sizes/add'
          a11yTitle={`Add size`} />
      );
    }

    let notifications = (
      <Notifications context={{ category: 'virtual-machine-sizes' }}
        includeResource={true} />
    );

    let items, onMore;
    if (result.items) {
      items = result.items.map((item, index) => (
        <SizeTile key={item.uri} item={item} index={index} />
      ));
      if (result.count > 0 && result.count < result.total) {
        onMore = this._onMore;
      }
    }

    return (
      <Box>
        <Header size='large' pad={{ horizontal: 'medium' }}>
          <Title responsive={false}>
            <NavControl />
            <span>Sizes</span>
          </Title>
          <Search inline={true} fill={true} size='medium' placeHolder='Search'
            value={searchText} onDOMChange={this._onSearch} />
          {addControl}
        </Header>
        {notifications}
        <Tiles flush={false} fill={false} onMore={onMore}>
          {items}
        </Tiles>
        <ListPlaceholder filteredTotal={result.total}
          unfilteredTotal={result.unfilteredTotal}
          emptyMessage='You do not have any sizes at the moment.'
          addControl={
            <Button icon={<AddIcon />} label='Add size'
              path='/virtual-machine-sizes/add'
              primary={true} a11yTitle={`Add size`} />
          } />
      </Box>
    );
  }
};

SizeIndex.propTypes = {
  index: PropTypes.object
};

let select = (state) => ({
  index: state.index,
  role: state.session.role
});

export default connect(select)(SizeIndex);
