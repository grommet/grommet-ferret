// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Box from 'grommet/components/Box';
import Section from 'grommet/components/Section';
import Topology from 'grommet/components/Topology';
import StatusIcon from 'grommet/components/icons/Status';
import Item from '../Item';

class Enclosure extends Component {

  constructor () {
    super();
  }

  _renderBay (index, serverHardware) {
    let status;
    let name;

    if (serverHardware) {
      status = <StatusIcon value={serverHardware.status} small={true} />;
      name = <Link to={'/server-hardware' + serverHardware.uri}>{serverHardware.name}</Link>;
    }

    return (
      <Topology.Part key={index} direction="column" justify="start" align="start">
        {status}
        {name}
      </Topology.Part>
    );
  }

  _renderFront () {
    let serverHardware = this.props.map.categories['server-hardware'] || [];
    let topBays = [];
    for (let i = 0; i < 8; i += 1) {
      topBays.push(this._renderBay(i, serverHardware[i]));
    }
    let bottomBays = [];
    for (let i = 8; i < 16; i += 1) {
      bottomBays.push(this._renderBay(i, serverHardware[i]));
    }

    return (
      <Topology.Part className="front" direction="column">
        <Topology.Parts direction="row">
          {topBays}
        </Topology.Parts>
        <Topology.Parts direction="row">
          {bottomBays}
        </Topology.Parts>
      </Topology.Part>
    );
  }

  _renderBack () {

    let switches = this.props.map.categories.switches || [];
    var interconnects = switches.map(function (interconnect) {
      return (
        <Topology.Part key={interconnect.uri} direction="row" justify="start" align="center">
          <StatusIcon value={interconnect.status} small={true} />
          {interconnect.name}
        </Topology.Part>
      );
    }, this);

    return (
      <Topology.Part className="back" direction="column">
        {interconnects[0]}
        {interconnects[1]}
        <Topology.Parts direction="row">
          <Topology.Part direction="column">
          </Topology.Part>
          <Topology.Part direction="row" justify="center" align="center">
            <StatusIcon value="ok" small={true} />
            <Topology.Label>fan 1</Topology.Label>
          </Topology.Part>
          <Topology.Part direction="row" justify="center" align="center">
            <StatusIcon value="ok" small={true} />
            <Topology.Label>fan 2</Topology.Label>
          </Topology.Part>
          <Topology.Part direction="row" justify="center" align="center">
            <StatusIcon value="ok" small={true} />
            <Topology.Label>fan 3</Topology.Label>
          </Topology.Part>
        </Topology.Parts>
        {interconnects[2]}
        {interconnects[3]}
        <Topology.Parts direction="row">
          <Topology.Part direction="column">
          </Topology.Part>
          <Topology.Part direction="row" justify="center" align="center">
            <StatusIcon value="ok" small={true} />
            <Topology.Label>fan 4</Topology.Label>
          </Topology.Part>
          <Topology.Part direction="row" justify="center" align="center">
            <StatusIcon value="ok" small={true} />
            <Topology.Label>fan 5</Topology.Label>
          </Topology.Part>
          <Topology.Part direction="row" justify="center" align="center">
            <StatusIcon value="ok" small={true} />
            <Topology.Label>fan 6</Topology.Label>
          </Topology.Part>
        </Topology.Parts>
        {interconnects[4]}
        {interconnects[5]}
      </Topology.Part>
    );
  }

  render () {

    let front;
    let back;
    if (this.props.map) {
      front = this._renderFront();
      back = this._renderBack();
    }

    return (
      <Item uri={this.props.params.splat}>
        <Box pad="small" />
        <Section pad="medium">
          <Topology>
            <Topology.Parts direction="column" uniform={true}>
              {front}
              {back}
            </Topology.Parts>
          </Topology>
        </Section>
      </Item>
    );
  }
}

Enclosure.propTypes = {
  map: PropTypes.object
};

let select = (state, props) => ({ map: state.item.map });

export default connect(select)(Enclosure);
