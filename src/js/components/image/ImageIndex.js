// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { refresh } from '../../actions/Api';
import { loadIndex, queryIndex, moreIndex, unloadIndex
  } from '../../actions/index';
import Box from 'grommet/components/Box';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Search from 'grommet/components/Search';
import Anchor from 'grommet/components/Anchor';
import Button from 'grommet/components/Button';
import AddIcon from 'grommet/components/icons/base/Add';
import List from 'grommet/components/List';
import Notification from 'grommet/components/Notification';
import Paragraph from 'grommet/components/Paragraph';
import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import Query from 'grommet-addons/utils/Query';
import NavControl from '../NavControl';
import Notifications from '../Notifications';
import ImageListItem from './ImageListItem';

class ImageIndex extends Component {

  constructor () {
    super();
    this._onSearch = this._onSearch.bind(this);
    this._onMore = this._onMore.bind(this);
    this.state = { searchText: '' };
  }

  componentDidMount () {
    this.props.dispatch(loadIndex({ category: 'images', sort: 'name:asc' }));
  }

  componentWillReceiveProps (nextProps) {
    // if any uploads have finished, refresh to pick up notifications
    for (let i=0; i<nextProps.uploads.length; i++) {
      let upload = nextProps.uploads[i];
      if ('Uploaded' === upload.state) {
        for (let j=0; j<this.props.uploads.length; j++) {
          let upload2 = this.props.uploads[j];
          if (upload2.file === upload.file && upload2.state !== upload.state) {
            this.props.dispatch(refresh());
            break;
          }
        }
      }
    }
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
    const { index, role, uploads } = this.props;
    const { searchText } = this.state;
    const result = index.result || {};

    let addControl;
    if ('read only' !== role) {
      addControl = (
        <Anchor icon={<AddIcon />} path='/images/add' a11yTitle={`Add image`} />
      );
    }

    let notifications = uploads
    .filter(upload => 'Uploading' === upload.state)
    .map(upload => (
      <Notification key={upload.file} status="unknown"
        message="Add"
        state={`Uploading ${upload.file}`}
        percentComplete={upload.percent}>
        <Paragraph className="secondary">Do no close or refresh your browser
        while the file is being uploaded. You can safely perform other
        operations though.</Paragraph>
      </Notification>
    ));

    notifications.push(
      <Notifications key="items" context={{ category: 'images' }}
        includeResource={true}/>
    );

    let items, onMore;
    if (result.items) {
      items = result.items.map((item, index) => (
        <ImageListItem key={item.uri} item={item} index={index} />
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
            <span>Images</span>
          </Title>
          <Search inline={true} fill={true} size='medium' placeHolder='Search'
            value={searchText} onDOMChange={this._onSearch} />
          {addControl}
        </Header>
        {notifications}
        <List onMore={onMore}>
          {items}
        </List>
        <ListPlaceholder filteredTotal={result.total}
          unfilteredTotal={result.unfilteredTotal}
          emptyMessage='You do not have any images at the moment.'
          addControl={
            <Button icon={<AddIcon />} label='Add image'
              path='/images/add'
              primary={true} a11yTitle={`Add image`} />
          } />
      </Box>
    );
  }
};

ImageIndex.propTypes = {
  index: PropTypes.object,
  uploads: PropTypes.arrayOf(PropTypes.object)
};

let select = (state) => ({
  index: state.index,
  role: state.session.role,
  uploads: state.image.uploads
});

export default connect(select)(ImageIndex);
