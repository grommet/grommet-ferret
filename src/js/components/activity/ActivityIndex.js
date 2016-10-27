// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {
  loadIndex, queryIndex, moreIndex, unloadIndex
} from '../../actions/index';
import Box from 'grommet/components/Box';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Search from 'grommet/components/Search';
import List from 'grommet/components/List';
import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import FilterControl from 'grommet-addons/components/FilterControl';
import Query from 'grommet-addons/utils/Query';
import NavControl from '../NavControl';
import ActivityListItem from './ActivityListItem';
import ActivityTile from './ActivityTile';
import ActivityItem from './ActivityItem';
import ActivityFilter from './ActivityFilter';

class ActiveGlobalListItem extends ActivityListItem {};

ActiveGlobalListItem.defaultProps = {
  includeResource: true,
  onlyActiveStatus: true
};

class ActivityGlobalTile extends ActivityTile {};

ActivityGlobalTile.defaultProps = {
  includeResource: true
};

class ActivityGlobalItem extends ActivityItem {};

ActivityGlobalItem.defaultProps = {
  includeResource: true
};

class ActivityIndex extends Component {

  constructor () {
    super();
    this._onSearch = this._onSearch.bind(this);
    this._onMore = this._onMore.bind(this);
    this._onFilterActivate = this._onFilterActivate.bind(this);
    this._onFilterDeactivate = this._onFilterDeactivate.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this._onDeselect = this._onDeselect.bind(this);
    this.state = { searchText: '' };
  }

  componentDidMount () {
    this.props.dispatch(loadIndex({
      category: ['alerts', 'tasks'], sort: 'created:desc'
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

  _onFilterActivate () {
    this.setState({ filterActive: true });
  }

  _onFilterDeactivate () {
    this.setState({ filterActive: false });
  }

  _onSelect (selection) {
    this.setState({ selection: selection });
  }

  _onDeselect () {
    this.setState({ selection: undefined });
  }

  render () {
    const { index } = this.props;
    const { filterActive, searchText, selection } = this.state;
    const result = index.result || {};

    let items, onMore, detailsLayer;
    if (result.items) {
      items = result.items.map((item, index) => (
        <ActiveGlobalListItem key={item.uri} item={item} index={index} />
      ));
      if (result.count > 0 && result.count < result.total) {
        onMore = this._onMore;
      }
      if (selection >= 0) {
        const uri = result.items[selection].uri;
        detailsLayer = (
          <ActivityGlobalItem uri={uri} onClose={this._onDeselect} />
        );
      }
    }

    let filterLayer;
    if (filterActive) {
      filterLayer = <ActivityFilter onClose={this._onFilterDeactivate} />;
    }

    return (
      <Box>
        <Header size='large' pad={{ horizontal: 'medium' }}>
          <Title responsive={false}>
            <NavControl />
            <span>Activity</span>
          </Title>
          <Search inline={true} fill={true} size='medium' placeHolder='Search'
            value={searchText} onDOMChange={this._onSearch} />
          <FilterControl filteredTotal={result.total}
            unfilteredTotal={result.unfilteredTotal}
            onClick={this._onFilterActivate} />
        </Header>
        <List selectable={true} onSelect={this._onSelect} onMore={onMore}>
          {items}
        </List>
        <ListPlaceholder filteredTotal={result.total}
          unfilteredTotal={result.unfilteredTotal}
          emptyMessage='You do not have any activity at the moment.' />
        {detailsLayer}
        {filterLayer}
      </Box>
    );
  }
};

ActivityIndex.propTypes = {
  index: PropTypes.object
};

let select = (state) => ({
  index: state.index
});

export default connect(select)(ActivityIndex);
