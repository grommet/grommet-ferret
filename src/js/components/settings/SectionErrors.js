// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { PropTypes } from 'react';

const SectionErrors = (props) => {

  const { errors, section } = props;
  let message;
  if (errors.length > 1) {
    message = `There are ${errors.length} issues with the ${section} settings.`;
  } else {
    message = errors[0].message;
  }
  return <span className="error">{message}</span>;
};

SectionErrors.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.shape({
    message: PropTypes.string
  })),
  section: PropTypes.string
};

export default SectionErrors;
