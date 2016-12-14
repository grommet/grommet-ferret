// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { filterIndex } from '../../actions/index';
import Layer from 'grommet/components/Layer';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import Section from 'grommet/components/Section';
import Button from 'grommet/components/Button';
import Heading from 'grommet/components/Heading';
import Select from 'grommet/components/Select';
import Box from 'grommet/components/Box';
import CloseIcon from 'grommet/components/icons/base/Close';
import StatusIcon from 'grommet/components/icons/Status';

const StatusLabel = (props) => (
  <Box direction='row' align='center' pad={{ between: 'small' }}>
    <StatusIcon value={props.value} size='small' />
    <span>{props.label}</span>
  </Box>
);

class ActivityFilter extends Component {

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

  render () {
    const { index } = this.props;
    const filter = index.filter || {};
    return (
      <Layer align='right' flush={true} closer={false}
        a11yTitle='Activity Filter'>
        <Sidebar size='medium'>
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
              <Heading tag='h3'>State</Heading>
              <Select inline={true} multiple={true} options={[
                { label: 'All', value: undefined },
                { label: 'Active', value: 'active' },
                { label: 'Locked', value: 'locked' },
                { label: 'Cleared', value: 'cleared' },
                { label: 'Running', value: 'running' },
                { label: 'Completed', value: 'completed' },
                { label: 'Error', value: 'error' }
              ]} value={filter.state} onChange={this._change('state')} />
            </Section>
            <Section pad={{ horizontal: 'large', vertical: 'small' }}>
              <Heading tag='h3'>Category</Heading>
              <Select inline={true} multiple={true} options={[
                { label: 'All', value: undefined },
                { label: 'Alerts', value: 'alerts' },
                { label: 'Tasks', value: 'tasks' }
              ]} value={filter.category} onChange={this._change('category')} />
            </Section>
          </div>
        </Sidebar>
      </Layer>
    );
  }
}

ActivityFilter.propTypes = {
  index: PropTypes.object
};

let select = (state) => ({ index: state.index });

export default connect(select)(ActivityFilter);
