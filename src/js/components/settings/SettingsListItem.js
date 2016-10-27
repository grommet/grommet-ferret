// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React from 'react';
import ListItem from 'grommet/components/ListItem';
import Box from 'grommet/components/Box';

// TODO: Refactor this file into multiple files

export default (props) => {

  return (
    <ListItem
      pad={{vertical: 'medium', horizontal: 'medium', between: 'medium'}}
      justify="between" align="center" responsive={false}
      separator={props.first ? 'horizontal' : 'bottom'}>
      <Box>
        {props.children}
      </Box>
      {props.control}
    </ListItem>
  );
};
