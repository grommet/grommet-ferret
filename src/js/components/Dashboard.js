// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { navActivate, dashboardLayout, dashboardLoad, dashboardUnload } from '../actions';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Search from 'grommet/components/Search';
import Logo from './Logo';
import Aggregate from 'grommet-index/components/Aggregate';
import IndexHistory from 'grommet-index/components/History';
import { Link } from 'react-router';
import store from '../store';

class Dashboard extends Component {

  constructor() {
    super();
    this._onOverTitle = this._onOverTitle.bind(this);
    this._onOutTitle = this._onOutTitle.bind(this);
    this._onClickTitle = this._onClickTitle.bind(this);
    this._onCloseNav = this._onCloseNav.bind(this);
    this._onClickSegment = this._onClickSegment.bind(this);
    this._onResize = this._onResize.bind(this);
    this._layout = this._layout.bind(this);
    this.state = {
      graphicSize: 'medium',
      dashboard: store.getState().dashboard,
      nav: store.getState().nav
    };
  }

  componentDidMount() {
    this.refs.search.focus();
    window.addEventListener('resize', this._onResize);
    this._onResize();
    this.props.dispatch(dashboardLoad(this.state.dashboard.tiles));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
    this.props.dispatch(dashboardUnload(this.state.dashboard.tiles));
  }

  _onOverTitle() {
    //this.props.dispatch(navPeek(true))
  }

  _onOutTitle() {
    //this.props.dispatch(navPeek(false))
  }

  _onClickTitle() {
    this.props.dispatch(navActivate(true));
  }

  _onCloseNav() {
    this.props.dispatch(navActivate(false));
  }

  _onClickSegment(tile, query) {
    // TODO
    //this.context.router.transitionTo(tile.route, {}, {q: query.fullText});
  }

  _layout() {
    const { dispatch, dashboard: {tiles, legendPlacement} } = this.props;
    var wideTileCount = 0;
    var normalTileCount = 0;
    // set wide chart count according to the space we have
    var dataPoints = Math.round(Math.max(4, window.innerWidth / 48));

    tiles.forEach((tile) => {
      if (tile.wide) {
        wideTileCount += 1;
      } else {
        normalTileCount += 1;
      }
    });

    // set legend placement
    let width = window.innerWidth;
    let height = window.innerHeight - 100;
    let ratio = width / height;
    let newLegendPlacement = legendPlacement;
    if (ratio < 1.1 && 'bottom' !== legendPlacement) {
      newLegendPlacement = 'bottom';
    } else if (ratio > 1.3 && 'right' !== legendPlacement) {
      newLegendPlacement = 'right';
    }

    // set graphic size
    // TODO: These numbers are empirical. Redo to be more formal.
    let graphicSize = 'medium';
    let roughRows = Math.ceil(wideTileCount + (normalTileCount / 3));
    if ((width / 300) < 3) {
      graphicSize = 'small';
    } else if ((height / roughRows) < 300) {
      graphicSize = 'small';
    } else if ((width / 660) > 3) {
      graphicSize = 'large';
    } else if ((height / roughRows) > 400) {
      graphicSize = 'large';
    }

    dispatch(dashboardLayout(graphicSize, dataPoints, newLegendPlacement));
  }

  _onResize() {
    // debounce
    clearTimeout(this._timer);
    this._timer = setTimeout(this._layout, 500);
  }

  _renderTile(tile, index) {
    const { graphicSize, legendPlacement } = this.props.dashboard;
    var header = null;
    if (tile.route) {
      var queryParams = {};
      if (tile.query) {
        queryParams.q = tile.query.fullText;
      }
      header = (
        <Link to={'/' + tile.category} query={queryParams}>
          {tile.name}
        </Link>
      );
    } else if (tile.name) {
      header = tile.name;
    }
    if (header) {
      header = <Header tag="h2" justify="center">{header}</Header>;
    }

    var contents = null;
    if (tile.history) {
      contents = (
        <IndexHistory attribute={tile.attribute} type={tile.type}
          series={tile.result} smooth={true} size={graphicSize} />
      );
    } else {
      contents = (
        <Aggregate type={tile.type}
          attribute={tile.attribute}
          query={tile.query}
          legend={{placement: legendPlacement}}
          series={tile.result}
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
    const { tiles } = this.props.dashboard;
    const { active: navActive } = this.props.nav;

    let tileComponents = tiles.map(this._renderTile, this);

    let title;
    if (! navActive) {
      title = (
        <span onMouseOver={this._onOverTitle}
          onMouseOut={this._onOutTitle}>
          <Title onClick={this._onClickTitle}>
            <Logo />
            <span>Ferret</span>
          </Title>
        </span>
      );
    }

    return (
      <div>
        <Header direction="row" justify="between" large={true} pad={{horizontal: 'medium'}}>
          {title}
          <Search ref="search" inline={true} className="flex" />
          {/*}
          <SessionMenu dropAlign={{right: 'right'}} />
          {*/}
        </Header>
        <Tiles fill={true} flush={false}>
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
    tiles: PropTypes.arrayOf(PropTypes.shape({
      attribute: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['bar', 'arc', 'circle', 'distribution', 'area', 'line'])
    })),
    wide: PropTypes.bool
  }).isRequired
};

let select = (state) => ({ dashboard: state.dashboard, nav: state.nav });

export default connect(select)(Dashboard);
