// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { indexLoad, indexUnload, indexMore, indexQuery, indexSelect, navActivate } from '../actions';
import Split from 'grommet/components/Split';
import Index from 'grommet-index/components/Index';
import IndexPropTypes from 'grommet-index/utils/PropTypes';
import Title from 'grommet/components/Title';
import Logo from './Logo';
import AddIcon from 'grommet/components/icons/base/Add';

class Items extends Component {

  constructor() {
    super();
    this._onClickTitle = this._onClickTitle.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this._onMore = this._onMore.bind(this);
    this._onQuery = this._onQuery.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(
      indexLoad(this.props.category, this.props.index, this.props.selection));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.category !== nextProps.category) {
      this.props.dispatch(indexUnload(this.props.index));
      this.props.dispatch(
        indexLoad(nextProps.category, nextProps.index, this.props.selection));
    }
  }

  componentWillUnmount() {
    this.props.dispatch(indexUnload(this.props.index));
  }

  _onClickTitle() {
    this.props.dispatch(navActivate(true));
  }

  _onSelect(selection) {
    this.props.dispatch(indexSelect(this.props.category, selection));
  }

  _onMore() {
    this.props.dispatch(indexMore(this.props.category, this.props.index));
  }

  _onQuery(query) {
    this.props.dispatch(indexQuery(this.props.category, this.props.index, query));
  }

  _renderIndex(navControl, addControl) {
    const { index: {label, attributes, query, result}, responsive, selection } = this.props;
    let view = this.props.index.view;
    let size;
    if (attributes.length > 3 && 'single' === responsive) {
      // switch to tiles so we don't squish in too much
      view = 'tiles';
      size = 'large';
    }
    return (
      <Index
        label={label}
        view={view}
        attributes={attributes}
        query={query}
        result={result}
        selection={selection}
        size={size}
        flush={false}
        onSelect={this._onSelect}
        onQuery={this._onQuery}
        onMore={this._onMore}
        addControl={addControl}
        navControl={navControl} />
    );
  }

  render() {
    const { nav: {active: navActive}, index } = this.props;
    let navControl;
    if (! navActive) {
      navControl = (
        <Title onClick={this._onClickTitle}>
          <Logo />
        </Title>
      );
    }

    let addControl;
    if (index.addRoute) {
      addControl = <Link to={index.addRoute}><AddIcon /></Link>;
    }

    let pane1 = this._renderIndex(navControl, addControl);
    let pane2 = this.props.children;

    return (
      <Split flex="both">
        {pane1}
        {pane2}
      </Split>
    );
  }

}

Items.propTypes = {
  category: PropTypes.string.isRequired,
  index: PropTypes.shape({
    attributes: IndexPropTypes.attributes,
    category: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    label: PropTypes.string,
    query: PropTypes.object,
    result: IndexPropTypes.result,
    view: PropTypes.oneOf(["table", "tiles", "list"]),
    addRoute: PropTypes.string
  }).isRequired,
  responsive: PropTypes.oneOf(['single', 'multiple']),
  selection: PropTypes.string
};

let select = (state, props) => {
  const category = state.route.pathname.split('/')[1];
  return {
    category: category,
    index: state.index.categories[category],
    responsive: state.nav.responsive,
    nav: state.nav,
    selection: state.index.selection
  };
};

export default connect(select)(Items);
