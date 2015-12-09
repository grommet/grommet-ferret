// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';

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
    var fill = "none";
    var stroke = "#01A982";
    if (this.props.inverse) {
      fill = "#01A982";
      stroke = "#FFFFFF";
    }
    return (
      <svg className={classes.join(' ')} viewBox="0 0 120 120" version="1.1">
        <g fill="none" stroke="none" fillRule="evenodd">
          <rect fill={fill} stroke="none" x="0" y="0" width="120" height="120"></rect>
          <g stroke={stroke} className="paths" strokeWidth="4">
            <path d="M54,96 L54,106 L14,106 L14,66 L24,66"></path>
            <path d="M24,36 L84,36 L84,96 L24,96 L24,36"></path>
            <path d="M34,36 L34,18 L102,18 L102,86 L84,86"></path>
            <rect x="34" y="66" width="20" height="20"></rect>
          </g>
        </g>
      </svg>
    );
  }

}

FerretLogo.propTypes = {
  inverse: PropTypes.bool,
  size: PropTypes.oneOf(["medium", "large"])
};

module.exports = FerretLogo;
