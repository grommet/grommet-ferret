// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {
  loadIndex, queryIndex, moreIndex, selectIndex, unloadIndex
} from '../../actions/index';
import Box from 'grommet/components/Box';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Section from 'grommet/components/Section';
import Label from 'grommet/components/Label';
import Search from 'grommet/components/Search';
import Anchor from 'grommet/components/Anchor';
import Button from 'grommet/components/Button';
import AddIcon from 'grommet/components/icons/base/Add';
import Tiles from 'grommet/components/Tiles';
import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import FilterControl from 'grommet-addons/components/FilterControl';
import Query from 'grommet-addons/utils/Query';
import NavControl from '../NavControl';
import VirtualMachineTile from './VirtualMachineTile';
import VirtualMachineFilter from './VirtualMachineFilter';

const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
let LAST_7 = new Date(TODAY.getTime());
LAST_7.setDate(LAST_7.getDate()-7);
let LAST_30 = new Date(TODAY.getTime());
LAST_30.setDate(LAST_30.getDate()-30);

const SECTIONS = {
  cpuUtilization: [
    {label: '90% or more', value: 90},
    {label: '40% or more', value: 40},
    {label: 'less than 40%'}
  ],
  diskUtilization: [
    {label: '90% or more', value: 90},
    {label: '40% or more', value: 40},
    {label: 'less than 40%'}
  ],
  memoryUtilization: [
    {label: '90% or more', value: 90},
    {label: '40% or more', value: 40},
    {label: 'less than 40%'}
  ],
  modified: [
    {label: 'Today', value: TODAY},
    {label: 'Last 7 days', value: LAST_7},
    {label: 'Last 30 days', value: LAST_30},
    {label: 'Earlier'}
  ],
  state: [
    {label: 'Online', value: 'Online'},
    {label: 'Offline', value: 'Offline'},
    {label: 'Unknown'}
  ]
};

class VirtualMachineIndex extends Component {

  constructor () {
    super();
    this._onSearch = this._onSearch.bind(this);
    this._onMore = this._onMore.bind(this);
    this._onFilterActivate = this._onFilterActivate.bind(this);
    this._onFilterDeactivate = this._onFilterDeactivate.bind(this);
    this.state = { searchText: '' };
  }

  componentDidMount () {
    this.props.dispatch(loadIndex({
      category: 'virtual-machines', sort: 'modified:desc'
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

  _select (uri) {
    return () => {
      this.props.dispatch(selectIndex('/virtual-machines', uri));
    };
  }

  _renderSection (label, items=[], onMore) {
    const tiles = items.map((item, index) => (
      <VirtualMachineTile key={item.uri} item={item} index={index}
        onClick={this._select(item.uri)}/>
    ));
    let header;
    if (label) {
      header = (
        <Header size='small' justify='start' responsive={false}
          separator='top' pad={{ horizontal: 'small' }}>
         <Label size='small'>{label}</Label>
        </Header>
      );
    }
    return (
      <Section key={label || 'section'} pad='none'>
        {header}
        <Tiles flush={false} fill={false} selectable={true} onMore={onMore}>
          {tiles}
        </Tiles>
      </Section>
    );
  }

  _renderSections (sortProperty, sortDirection) {
    const { index } = this.props;
    const result = index.result || { items: [] };
    const items = (result.items || []).slice(0);
    let sections = [];

    SECTIONS[sortProperty].forEach((section) => {

      let sectionValue = section.value;
      if (sectionValue instanceof Date) {
        sectionValue = sectionValue.getTime();
      }
      let sectionItems = [];

      while (items.length > 0) {
        const item = items[0];
        let itemValue = (item.hasOwnProperty(sortProperty) ?
          item[sortProperty] : item.attributes[sortProperty]);
        if (itemValue instanceof Date) {
          itemValue = itemValue.getTime();
        }

        if (undefined === sectionValue ||
          ('asc' === sortDirection && itemValue <= sectionValue) ||
          ('desc' === sortDirection && itemValue >= sectionValue)) {
          // item is in section
          sectionItems.push(items.shift());
        } else {
          // done
          break;
        }
      }

      if (sectionItems.length > 0) {
        sections.push(this._renderSection(section.label, sectionItems));
      }
    });

    return sections;
  }

  render () {
    const { index, role } = this.props;
    const { filterActive, searchText } = this.state;
    const result = index.result || {};

    let addControl;
    if ('read only' !== role) {
      addControl = (
        <Anchor icon={<AddIcon />} path='/virtual-machines/add'
          a11yTitle={`Add virtual machine`} />
      );
    }

    let sections;
    let sortProperty, sortDirection;
    if (index.sort) {
      [ sortProperty, sortDirection ] = index.sort.split(':');
    }
    if (sortProperty && SECTIONS[sortProperty]) {
      sections = this._renderSections(sortProperty, sortDirection);
    } else {
      let onMore;
      if (result.count > 0 && result.count < result.total) {
        onMore = this._onMore;
      }
      sections = this._renderSection(undefined, result.items, onMore);
    }

    let filterLayer;
    if (filterActive) {
      filterLayer = <VirtualMachineFilter onClose={this._onFilterDeactivate} />;
    }

    return (
      <Box>
        <Header size='large' pad={{ horizontal: 'medium' }}>
          <Title responsive={false}>
            <NavControl />
            <span>Virtual Machines</span>
          </Title>
          <Search inline={true} fill={true} size='medium' placeHolder='Search'
            value={searchText} onDOMChange={this._onSearch} />
          {addControl}
          <FilterControl filteredTotal={result.total}
            unfilteredTotal={result.unfilteredTotal}
            onClick={this._onFilterActivate} />
        </Header>
        {sections}
        <ListPlaceholder filteredTotal={result.total}
          unfilteredTotal={result.unfilteredTotal}
          emptyMessage='You do not have any virtual machines at the moment.'
          addControl={
            <Button icon={<AddIcon />} label='Add virtual machine'
              path='/virtual-machines/add'
              primary={true} a11yTitle={`Add virtual machine`} />
          } />
        {filterLayer}
      </Box>
    );
  }
};

VirtualMachineIndex.propTypes = {
  index: PropTypes.object
};

let select = (state) => ({
  index: state.index,
  role: state.session.role
});

export default connect(select)(VirtualMachineIndex);
