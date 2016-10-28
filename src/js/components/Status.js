// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { navEnable } from '../actions/nav';
import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Box from 'grommet/components/Box';
import Meter from 'grommet/components/Meter';
import Value from 'grommet/components/Value';
import Paragraph from 'grommet/components/Paragraph';
import DownloadIcon from 'grommet/components/icons/base/Download';
import Button from 'grommet/components/Button';
import Logo from './Logo';
import SessionMenu from './SessionMenu';

class Status extends Component {

  componentDidMount () {
    this.props.dispatch(navEnable(false));
  }

  componentWillUnmount () {
    this.props.dispatch(navEnable(true));
  }

  render () {
    const { status } = this.props;

    let progress;
    if (status.progress) {
      progress = (
        <Box direction="row" align="center" pad={{ between: 'medium' }}>
          <Meter size="large"
            series={[{
              value: status.progress.percent, colorIndex: 'light-1'
            }]} />
          <Value value={status.progress.percent} units="%" size="large" />
        </Box>
      );
    }

    let action;
    if (status.callToAction) {
      let icon;
      if (status.callToAction.icon) {
        if ('Download' === status.callToAction.icon) {
          icon = <DownloadIcon />;
        }
      }
      action = (
        <Button path={status.callToAction.path} primary={true}
          label={status.callToAction.label} icon={icon} />
      );
    }

    return (
      <Article>
        <Section full={true} align="start"
          colorIndex="dark" texture="url(img/ferret_background.png)"
          pad="large" justify="center">
          <Header float={true} justify="between" pad={{horizontal: 'medium'}}>
            <span />
            <SessionMenu dropAlign={{right: 'right'}} />
          </Header>
          <Logo size="large" colorIndex={status.colorIndex}
            busy={status.busy} />
          <Heading tag="h1">{status.label}</Heading>
          <Paragraph>{status.message}</Paragraph>
          {progress}
          {action}
        </Section>
      </Article>
    );
  }
}

Status.propTypes = {
  status: PropTypes.shape({
    busy: PropTypes.bool,
    colorIndex: PropTypes.string,
    label: PropTypes.string,
    message: PropTypes.string,
    callToAction: PropTypes.shape({
      label: PropTypes.string,
      path: PropTypes.string
    }),
    progress: PropTypes.shape({
      value: PropTypes.number,
      total: PropTypes.number
    })
  })
};

let select = (state) => ({ status: state.status });

export default connect(select)(Status);
