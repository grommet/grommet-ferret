// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import SVGIcon from 'grommet/components/SVGIcon';

const CLASS_ROOT = 'ferret-logo';

class Logo extends Component {
  render() {
    const { busy, className, colorIndex, size, ...props } = this.props;
    let classes = [CLASS_ROOT];
    if (busy) {
      classes.push(`${CLASS_ROOT}--busy`);
    }
    if (className) {
      classes.push(className);
    }
    return (
      <SVGIcon {...props} colorIndex={colorIndex} size={size}
        viewBox='0 0 48 48' version='1.1' type='logo' a11yTitle='Ferret Logo'
        className={classes.join('')}>
        <g fill='none'>
          <g transform='translate(1.000000, 5.000000)' strokeWidth='2'>
            <path d='M23.0030785,37 L46,24.5 L46,13 L23.0030785,13 L0,24.5 L8.8817842e-16,37 L23.0030785,37 Z' />
            <path d='M22.9969215,24 L45.9999999,12.5 L46,0 L22.9969215,0 L3.0027536e-11,12.5 L0,24 L22.9969215,24 Z' transform='translate(23.000000, 12.000000) scale(-1, 1) translate(-23.000000, -12.000000) ' />
            <path d='M1,1 L23.0030785,13 L23.0030785,24 L1,36' />
          </g>
        </g>
      </SVGIcon>
    );
  }

}

Logo.propTypes = {
  busy: PropTypes.bool,
  colorIndex: PropTypes.string,
  size: PropTypes.oneOf(['medium', 'large'])
};

Logo.defaultProps = {
  colorIndex: 'brand'
};

module.exports = Logo;
