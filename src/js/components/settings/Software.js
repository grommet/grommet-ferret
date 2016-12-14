// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadSettings, loadSoftware } from '../../actions/actions';
import Anchor from 'grommet/components/Anchor';
import Article from 'grommet/components/Article';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Section from 'grommet/components/Section';
import Box from 'grommet/components/Box';
import Footer from 'grommet/components/Footer';
import LinkPreviousIcon from 'grommet/components/icons/base/LinkPrevious';
import GithubIcon from 'grommet/components/icons/base/SocialGithub';
import GrommetIcon from 'grommet/components/icons/Grommet';
import Timestamp from 'grommet/components/Timestamp';

class Software extends Component {

  componentDidMount () {
    this.props.dispatch(loadSettings());
    this.props.dispatch(loadSoftware());
  }

  render () {
    const { productName } = this.props;
    const software = this.props.software || {};
    const hypervisorVersion =
      (software.hypervisor ? software.hypervisor.version : '--');

    return (
      <Article primary={true}>
        <Header pad={{horizontal: "small", vertical: "medium"}}
          justify="between" size="large" colorIndex="light-2">
          <Box direction="row" align="center" pad={{between: 'small'}}
            responsive={false}>
            <Anchor icon={<LinkPreviousIcon />} path="/settings/edit"
              a11yTitle="Return" />
            <Heading tag="h1">
              {productName.short} v<strong>{software.version || '--'}</strong>
            </Heading>
          </Box>
        </Header>
        <Section pad="medium">
          <Heading tag="h2" margin="none">Summary</Heading>
          <dl>
            <dt>{productName.long}</dt>
            <dd>{software.version || '--'}</dd>
            <dt>Released</dt>
            <dd><Timestamp value={new Date()} /></dd>
            <dt>vCenter</dt>
            <dd>{hypervisorVersion}</dd>
          </dl>
        </Section>
        <Section pad="medium">
          <Anchor href={software.releaseNotes} target="notes"
            primary={true}>
            Release notes
          </Anchor>
          <Box direction="column" pad={{vertical: 'medium', between: 'small'}}>
            <Anchor href={software.eula} target="notes">
              License agreement
            </Anchor>
            <Anchor href={software.writtenOffer} target="notes">
              Written offer
            </Anchor>
          </Box>
        </Section>
        <Footer direction='column' align='start'>
          <Box direction='row'
            pad={{ horizontal: 'medium', vertical: 'small' }}>
            <Anchor icon={<GithubIcon />} label="GitHub"
              href='https://github.com/grommet/grommet-ferret' />
          </Box>
          <Box direction='row'
            pad={{ horizontal: 'medium', vertical: 'small' }}>
            <Anchor href='https://grommet.io'>
              <Box pad={{ between: 'small' }} direction='row' align='center'>
                <GrommetIcon size='small'/>
                <span>Grommet</span>
              </Box>
            </Anchor>
          </Box>
        </Footer>
      </Article>
    );
  }
}

Software.propTypes = {
  productName: PropTypes.shape({
    long: PropTypes.string,
    short: PropTypes.string
  }),
  software: PropTypes.object
};

let select = (state, props) => {
  const software = ('update' === state.route.location.pathname.split('/')[2] ?
    state.software : state.settings.settings);
  return {
    productName: state.settings.productName,
    software: software
  };
};

export default connect(select)(Software);
