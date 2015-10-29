// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';

const CLASS_ROOT = 'logo-icon';

class FerretLogo extends Component {

  render() {
    var classes = [CLASS_ROOT];
    if (this.props.size) {
      classes.push(CLASS_ROOT + '--' + this.props.size);
      classes.push('color-index-brand');
    }
    if (this.props.className) {
      classes.push(this.props.className);
    }
    return (
      <svg className={classes.join(' ')} viewBox="0 0 120 120" version="1.1" stroke="#231F20">
        <g strokeWidth="5" fill="none" fillRule="evenodd">
          <path d="M51.9151515,59.9575758 C51.9151515,70.4275103 43.4275103,78.9151515 32.9575758,78.9151515 C22.4876412,78.9151515 14,70.4275103 14,59.9575758 C14,49.4876412 22.4876412,41 32.9575758,41 C43.4275103,41 51.9151515,49.4876412 51.9151515,59.9575758 L51.9151515,59.9575758 Z M46.3878788,73.3878788 L62,89 L46.3878788,73.3878788 Z"></path>
          <path d="M95.9151515,59.9575758 C95.9151515,70.4275103 87.4275103,78.9151515 76.9575758,78.9151515 C66.4876412,78.9151515 58,70.4275103 58,59.9575758 C58,49.4876412 66.4876412,41 76.9575758,41 C87.4275103,41 95.9151515,49.4876412 95.9151515,59.9575758 L95.9151515,59.9575758 Z M90.3878788,73.3878788 L106,89 L90.3878788,73.3878788 Z" transform="translate(82.000000, 65.000000) scale(-1, 1) translate(-82.000000, -65.000000) "></path>
          <path d="M60,46.5 C60,23.9365968 31.8617961,11.3045872 16,10.5"></path>
          <path d="M104,46.5 C104,23.9365968 75.8617961,11.3045872 60,10.5" transform="translate(82.000000, 28.500000) scale(-1, 1) translate(-82.000000, -28.500000) "></path>
          <path d="M60,44.4999988 L60,5.529948" strokeLinecap="square"></path>
        </g>
      </svg>
    );
  }

}

FerretLogo.propTypes = {
  size: React.PropTypes.oneOf(["medium", "large"])
};

module.exports = FerretLogo;
