// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Footer from 'grommet/components/Footer';
import Heading from 'grommet/components/Heading';
import Paragraph from 'grommet/components/Paragraph';
import Button from 'grommet/components/Button';
import Logo from './Logo';

class Promo extends Component {

  constructor () {
    super();
    this._onContact = this._onContact.bind(this);
  }

  _onContact () {
    // no-op for now
  }

  render () {
    const { productName } = this.props;
    return (
      <Article scrollStep={true} controls={true}>
        <Section full={true}
          colorIndex="dark" texture="url(img/ferret_background.png)"
          pad="large" justify="center" align="center">
          <Heading tag="h1"><strong>{productName}</strong></Heading>
          <Paragraph>Shape the future of your hyperconverged infrastucture
            with {productName}.</Paragraph>
        </Section>
        <Section full={true}
          pad="large" justify="center" align="center">
          <Logo size="large" />
          <Heading tag="h1">Shape your future with {productName}.</Heading>
          <Paragraph>Maecenas faucibus mollis interdum. Praesent commodo cursus
            magna, vel scelerisque nisl consectetur et. Donec sed odio dui.
            Etiam porta sem malesuada magna mollis euismod.</Paragraph>
        </Section>
        <Section full={true} colorIndex="neutral-1"
          pad="large" justify="center" align="center">
          <Heading tag="h1">Hyperconverged Infrastructure where and when you
            need it.</Heading>
          <Paragraph>Cras mattis consectetur purus sit amet fermentum. Praesent
            commodo cursus magna, vel scelerisque nisl consectetur et.
            Donec sed odio dui. Curabitur blandit tempus porttitor. Duis
            mollis, est non commodo luctus.</Paragraph>
        </Section>
        <Section full={true} colorIndex="dark"
          texture="url(img/phoenix_sparks.jpg)"
          pad="large" justify="center" align="center">
          <Heading tag="h1">
            Forge a new experience for you and your comapny. </Heading>
          <Paragraph>Sed posuere consectetur est at lobortis.
            Praesent commodo cursus
            magna, vel sceleris que nisl consectetur et.</Paragraph>
          <Button label="Contact Us" accent={true} onClick={this._onContact} />
        </Section>
        <Footer direction="column" align="start"
          pad="medium" colorIndex="grey-2">
          <Paragraph>© 2016 Grommet Labs</Paragraph>
        </Footer>
      </Article>
    );
  }
}

let select = (state) => ({
  productName: state.settings.productName.long
});

export default connect(select)(Promo);
