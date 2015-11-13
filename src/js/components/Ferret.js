// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { navResponsive } from '../actions';
import App from 'grommet/components/App';
import Split from 'grommet/components/Split';
import NavSidebar from './NavSidebar';

class Indexer extends Component {

  constructor() {
    super();
    this._onResponsive = this._onResponsive.bind(this);
  }

  _onResponsive(responsive) {
    this.props.dispatch(navResponsive(responsive));
  }

  render() {
    const { active: navActive } = this.props;

    var pane1 = navActive ? <NavSidebar /> : null;
    var pane2 = this.props.children;

    return (
      <App centered={false}>
        <Split flex="right" onResponsive={this._onResponsive} priority="left">
          {pane1}
          {pane2}
        </Split>
      </App>
    );
  }
}

let select = (state) => state.nav;

export default connect(select)(Indexer);
