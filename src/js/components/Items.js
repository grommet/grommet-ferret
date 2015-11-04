// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { indexLoad, indexUnload, indexMore, indexQuery, indexSelect, indexResponsive, navActivate } from '../actions';
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
    this._onResponsive = this._onResponsive.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this._onMore = this._onMore.bind(this);
    this._onQuery = this._onQuery.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(indexLoad(this.props.category, this.props.index));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.category !== nextProps.category) {
      this.props.dispatch(indexUnload(this.props.index));
      this.props.dispatch(indexLoad(nextProps.category, nextProps.index));
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

  _onResponsive (responsive) {
    this.props.dispatch(indexResponsive(responsive));
  }

  _renderIndex(navControl, addControl) {
    const { index: {label, view, attributes, query, result}, selection } = this.props;
    return (
      <Index
        label={label}
        view={view}
        attributes={attributes}
        query={query}
        result={result}
        selection={selection}
        flush={false}
        onSelect={this._onSelect}
        onQuery={this._onQuery}
        onMore={this._onMore}
        addControl={addControl}
        navControl={navControl} />
    );
  }

  render() {
    const { nav: {active: navActive}, responsive, index, selection } = this.props;
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

    let pane1;
    let pane2;

    if ('single' === responsive) {
      if (selection) {
        pane1 = this.props.children;
      } else {
        pane1 = this._renderIndex(navControl, addControl);
      }
    } else {
      pane1 = this._renderIndex(navControl, addControl);
      pane2 = this.props.children;
    }

    return (
      <Split onResponsive={this._onResponsive} flex="both">
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
    category: PropTypes.string,
    label: PropTypes.string,
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
    responsive: state.index.responsive,
    nav: state.nav,
    selection: state.index.selection
  };
};

export default connect(select)(Items);
