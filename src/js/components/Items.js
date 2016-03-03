// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { indexLoad, indexUnload, indexMore, indexMoreBefore,
  indexQuery, indexSelect, navActivate } from '../actions';
import Split from 'grommet/components/Split';
import Index from 'grommet-index/components/Index';
import IndexPropTypes from 'grommet-index/utils/PropTypes';
import Title from 'grommet/components/Title';
import Logo from './Logo'; // './HPELogo';
import Anchor from 'grommet/components/Anchor';
import AddIcon from 'grommet/components/icons/base/Add';

class Items extends Component {

  constructor() {
    super();
    this._onClickTitle = this._onClickTitle.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this._onMore = this._onMore.bind(this);
    this._onMoreBefore = this._onMoreBefore.bind(this);
    this._onQuery = this._onQuery.bind(this);
    this._onFilter = this._onFilter.bind(this);
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
    // if (this.props.category !== nextProps.category ||
    //   (nextProps.index && (
    //     (nextProps.index.query && ! this.props.index.query) ||
    //     (! nextProps.index.query && this.props.index.query) ||
    //     (nextProps.index.query && this.props.index.query &&
    //       this.props.index.query.text !== nextProps.index.query.text)))) {
    //   this._scrollOnUpdate = true;
    // }
  }

  componentDidUpdate() {
    // if (this._scrollOnUpdate) {
    //   this.refs.index.scrollToSelection();
    //   this._scrollOnUpdate = false;
    // }
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

  _onMoreBefore() {
    this.props.dispatch(indexMoreBefore(this.props.category, this.props.index));
  }

  _onQuery(query) {
    const { index, category } = this.props;
    this.props.dispatch(indexQuery(category, index, query, index.filters));
  }

  _onFilter(filters) {
    const { index, category } = this.props;
    this.props.dispatch(indexQuery(category, index, index.query, filters));
  }

  render() {
    const { nav: {active: navActive}, index, responsive, selection } = this.props;

    let view = this.props.index.view;
    let size;
    if (index.attributes.length > 3 && 'single' === responsive) {
      // switch to tiles so we don't squish in too much
      view = 'tiles';
      size = 'large';
    }

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
      addControl = <Link to={index.addRoute}><Anchor tag="span"><AddIcon /></Anchor></Link>;
    }

    return (
      <Split flex="both">
        <Index ref="index"
          label={index.label}
          view={view}
          attributes={index.attributes}
          query={index.query}
          filter={index.filters}
          result={index.result}
          selection={selection}
          size={size}
          flush={false}
          onSelect={this._onSelect}
          onQuery={this._onQuery}
          onFilter={this._onFilter}
          onMore={this._onMore}
          onMoreBefore={this._onMoreBefore}
          addControl={addControl}
          navControl={navControl} />
        {this.props.children}
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
