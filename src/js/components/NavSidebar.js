// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { navActivate } from '../actions';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import Footer from 'grommet/components/Footer';
import Title from 'grommet/components/Title';
import Logo from './Logo';
import Menu from 'grommet/components/Menu';
import CloseIcon from 'grommet/components/icons/Clear';
import SessionMenu from './SessionMenu';

class NavSidebar extends Component {

  constructor() {
    super();
    this._onClose = this._onClose.bind(this);
  }

  _onClose() {
    this.props.dispatch(navActivate(false));
  }

  render() {
    const { nav: {items} } = this.props;
    var links = items.map(function (page) {
      return (
        <Link key={page.label} to={page.path} activeClassName="active">
          {page.label}
        </Link>
      );
    }, this);

    return (
      <Sidebar colorIndex="light-2" fixed={true} separator="right">
        <Header large={true} justify="between" pad={{horizontal: 'medium'}}>
          <Title onClick={this._onClose}>
            <Logo />
            <span>Indexer</span>
          </Title>
          <Menu responsive={false}>
            <div onClick={this._onClose}>
              <CloseIcon />
            </div>
          </Menu>
        </Header>
        <Menu primary={true}>
          {links}
        </Menu>
        <Footer pad="medium">
          <SessionMenu dropAlign={{bottom: 'bottom'}} />
        </Footer>
      </Sidebar>
    );
  }

}

NavSidebar.propTypes = {
  nav: PropTypes.shape({
    items: PropTypes.arrayOf(PropTypes.shape({
      path: PropTypes.string,
      label: PropTypes.string
    }))
  }),
  onClose: PropTypes.func,
  path: PropTypes.string
};

// We don't use the path explicitly, but we rely on this connection to
// trigger resetting the active Link state.
let select = (state) => ({ nav: state.nav, path: state.route.pathname });

export default connect(select)(NavSidebar);
