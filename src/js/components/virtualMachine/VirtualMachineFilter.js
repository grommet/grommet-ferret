// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { filterIndex, sortIndex } from '../../actions/index';
import Layer from 'grommet/components/Layer';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import Section from 'grommet/components/Section';
import Button from 'grommet/components/Button';
import Heading from 'grommet/components/Heading';
import Select from 'grommet/components/Select';
import Box from 'grommet/components/Box';
import Sort from 'grommet-addons/components/Sort';
import CloseIcon from 'grommet/components/icons/base/Close';
import StatusIcon from 'grommet/components/icons/Status';

const StatusLabel = (props) => (
  <Box direction='row' align='center' pad={{ between: 'small' }}>
    <StatusIcon value={props.value} size='small' />
    <span>{props.label}</span>
  </Box>
);

class VirtualMachineFilter extends Component {

  constructor () {
    super();
    this._onChangeSort = this._onChangeSort.bind(this);
  }

  _change (name) {
    return (event) => {
      const { index } = this.props;
      let nextFilter = { ...index.filter };
      if (! event.option.value) {
        // user selected the 'All' option, which has no value, clear filter
        delete nextFilter[name];
      } else {
        // we get the new option passed back as an object,
        // normalize it to just a value
        nextFilter[name] = event.value.map(value => (
          typeof value === 'object' ? value.value : value)
        );
        if (nextFilter[name].length === 0) {
          delete nextFilter[name];
        }
      }
      this.props.dispatch(filterIndex(index, nextFilter));
    };
  }

  _onChangeSort (sort) {
    const { index } = this.props;
    this.props.dispatch(sortIndex(index, `${sort.value}:${sort.direction}`));
  }

  render () {
    const { index } = this.props;

    const filter = index.filter || {};
    let sortProperty, sortDirection;
    if (index.sort) {
      [ sortProperty, sortDirection ] = index.sort.split(':');
    }

    return (
      <Layer align='right' flush={true} closer={false}
        a11yTitle='Virtual Machines Filter'>
        <Sidebar size='large'>
          <div>
            <Header size='large' justify='between' align='center'
              pad={{ horizontal: 'medium', vertical: 'medium' }}>
              <Heading tag='h2' margin='none'>Filter</Heading>
              <Button icon={<CloseIcon />} plain={true}
                onClick={this.props.onClose} />
            </Header>
            <Section pad={{ horizontal: 'large', vertical: 'small' }}>
              <Heading tag='h3'>Status</Heading>
              <Select inline={true} multiple={true} options={[
                { label: 'All', value: undefined },
                { label: <StatusLabel value='critical' label='Critical' />,
                  value: 'critical' },
                { label: <StatusLabel value='warning' label='Warning' />,
                  value: 'warning' },
                { label: <StatusLabel value='ok' label='OK' />,
                  value: 'ok' },
                { label: <StatusLabel value='disabled' label='Disabled' />,
                  value: 'disabled' },
                { label: <StatusLabel value='unknown' label='Unknown' />,
                  value: 'unknown'}
              ]} value={filter.status} onChange={this._change('status')} />
            </Section>
            <Section pad={{ horizontal: 'large', vertical: 'small' }}>
              <Heading tag='h3'>Sort</Heading>
              <Sort options={[
                { label: 'Name', value: 'name', direction: 'asc' },
                { label: 'State', value: 'state', direction: 'asc' },
                { label: 'Modified', value: 'modified', direction: 'desc' },
                { label: 'CPU utilization', value: 'cpuUtilization',
                  direction: 'desc' },
                { label: 'Memory utilization', value: 'memoryUtilization',
                  direction: 'desc' },
                { label: 'Storage utilization', value: 'diskUtilization',
                  direction: 'desc' }
              ]} value={sortProperty} direction={sortDirection}
              onChange={this._onChangeSort} />
            </Section>
          </div>
        </Sidebar>
      </Layer>
    );
  }
}

VirtualMachineFilter.propTypes = {
  index: PropTypes.object
};

let select = (state) => ({ index: state.index });

export default connect(select)(VirtualMachineFilter);
