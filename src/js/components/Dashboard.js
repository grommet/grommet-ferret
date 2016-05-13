// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { navActivate, dashboardLayout, dashboardLoad, dashboardSearch, dashboardUnload, indexNav, indexSelect } from '../actions';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Search from 'grommet/components/Search';
import Aggregate from 'grommet-index/components/Aggregate';
import IndexHistory from 'grommet-index/components/History';
import Logo from './Logo'; // './HPELogo';
import SessionMenu from './SessionMenu';

class Dashboard extends Component {

  constructor() {
    super();

    this._onClickTitle = this._onClickTitle.bind(this);
    this._onCloseNav = this._onCloseNav.bind(this);
    this._onClickSegment = this._onClickSegment.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this._onResize = this._onResize.bind(this);
    this._layout = this._layout.bind(this);

  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
    this.props.dispatch(dashboardLoad(this.props.dashboard.tiles));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.nav.active !== nextProps.nav.active) {
      // The NavSidebar is changing, relayout when it finishes animating.
      // TODO: Convert to an animation event listener.
      this._onResize();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
    this.props.dispatch(dashboardUnload(this.props.dashboard.tiles));
  }

  _onClickTitle() {
    this.props.dispatch(navActivate(true));
  }

  _onCloseNav() {
    this.props.dispatch(navActivate(false));
  }

  _onClickSegment(tile, query) {
    this.props.dispatch(indexNav(tile.path, tile.category, query));
  }

  _onSearch(value) {
    if (value.hasOwnProperty('uri')) {
      // this is a suggestion
      this.props.dispatch(indexSelect(value.category, value.uri));
    } else {
      this.props.dispatch(dashboardSearch(value));
    }
  }

  _layout() {
    const { dispatch, dashboard: {tiles, legendPlacement} } = this.props;
    let content = this.refs.content;
    if (content) {
      let rect = content.getBoundingClientRect();
      let tilesOffset = ReactDOM.findDOMNode(this.refs.tiles).
        getBoundingClientRect().top + document.body.scrollTop;
      let wideTileCount = 0;
      let normalTileCount = 0;
      // set wide chart count according to the space we have
      let dataPoints = Math.round(Math.max(4, rect.width / 48));

      tiles.forEach((tile) => {
        if (tile.wide) {
          wideTileCount += 1;
        } else {
          normalTileCount += 1;
        }
      });

      // set legend placement
      let width = rect.width;
      let height = rect.height - tilesOffset;
      let ratio = width / height;
      let newLegendPlacement = legendPlacement;
      if (ratio < 1.05 && 'bottom' !== legendPlacement) {
        newLegendPlacement = 'bottom';
      } else if (ratio > 1.2 && 'right' !== legendPlacement) {
        newLegendPlacement = 'right';
      }

      // set graphic size
      // TODO: These numbers are empirical. Redo to be more formal.
      let graphicSize = 'medium';
      let roughRows = Math.ceil(wideTileCount + (normalTileCount / 3));
      if ((width / 410) < 3) {
        graphicSize = 'small';
      } else if ((height / roughRows) < 370) {
        graphicSize = 'small';
      } else if ((width / 510) > 3) {
        graphicSize = 'large';
      } else if ((height / roughRows) > 500) {
        graphicSize = 'large';
      }

      dispatch(dashboardLayout(graphicSize, dataPoints, newLegendPlacement,
        this.props.dashboard.tiles));
    }
  }

  _onResize() {
    // debounce
    clearTimeout(this._timer);
    this._timer = setTimeout(this._layout, 500);
  }

  _renderTile(tile, index) {
    const { graphicSize, legendPlacement } = this.props.dashboard;
    let header = null;
    if (! tile.history) {
      let path = tile.path || '/' + tile.category;
      let queryParams = {};
      if (tile.query) {
        queryParams.q = tile.query.toString();
      }
      header = (
        <Link to={path} query={queryParams}>
          {tile.name}
        </Link>
      );
    } else if (tile.name) {
      header = tile.name;
    }
    if (header) {
      header = <Header tag="h2" justify="center">{header}</Header>;
    }

    let a11yProps = {
      a11yTitleId: `dashboard_item_title_${index}`,
      a11yDescId: `dashboard_item_desc_${index}`
    };

    let contents = null;
    if (tile.history) {
      contents = (
        <IndexHistory {...a11yProps} type={tile.type} name={tile.attribute}
          series={tile.result} smooth={true} size={graphicSize}
          legend={tile.legend}
        />
      );
    } else {
      contents = (
        <Aggregate {...a11yProps} type={tile.type}
          name={tile.attribute}
          query={tile.query}
          legend={{placement: legendPlacement}}
          values={tile.result}
          size={graphicSize}
          onClick={function (query) {
            this._onClickSegment(tile, query);
          }.bind(this)} />
      );
    }

    return (
      <Tile key={index} wide={tile.wide}>
        {header}
        {contents}
      </Tile>
    );
  }

  render() {
    const { tiles, searchText, searchSuggestions } = this.props.dashboard;
    const { active: navActive } = this.props.nav;

    let tileComponents = tiles.map(this._renderTile, this);

    let title;
    let session;
    if (! navActive) {
      title = (
        <Title onClick={this._onClickTitle} a11yTitle="Open Menu">
          <Logo />
          Ferret
        </Title>
      );

      session = <SessionMenu dropAlign={{right: 'right'}} />;
    }

    return (
      <div ref="content" className="dashboard">
        <Header direction="row" justify="between" large={true}
          pad={{horizontal: 'medium', between: 'small'}}>
          <div> {/* Wrap title in div to prevent it from getting truncated */}
            {title}
          </div>
          <Search ref="search" inline={true}
            placeHolder="Search" fill={true}
            defaultValue={searchText} onChange={this._onSearch}
            suggestions={searchSuggestions} />
          {session}
        </Header>
        <Tiles ref="tiles" fill={true} flush={false}>
          {tileComponents}
        </Tiles>
      </div>
    );
  }

}

Dashboard.propTypes = {
  dashboard: PropTypes.shape({
    count: PropTypes.number,
    graphicSize: PropTypes.oneOf(['small', 'medium', 'large']),
    history: PropTypes.bool,
    interval: PropTypes.string,
    legendPlacement: PropTypes.oneOf(['right', 'bottom']),
    searchSuggestions: PropTypes.arrayOf(PropTypes.shape({
      category: React.PropTypes.string,
      name: React.PropTypes.string,
      uri: React.PropTypes.string
    })),
    searchText: PropTypes.string,
    tiles: PropTypes.arrayOf(PropTypes.shape({
      attribute: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['bar', 'arc', 'circle', 'distribution', 'area', 'line'])
    })),
    wide: PropTypes.bool
  }).isRequired
};

let select = (state) => {
  return ({ dashboard: state.dashboard, nav: state.nav });
};

export default connect(select)(Dashboard);
