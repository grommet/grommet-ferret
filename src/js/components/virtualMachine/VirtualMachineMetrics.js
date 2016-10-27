// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Box from 'grommet/components/Box';
import Section from 'grommet/components/Section';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';
import AnnotatedMeter from 'grommet-addons/components/AnnotatedMeter';
import Chart, { Axis, Base, HotSpots, Layers, Line, Marker, MarkerLabel }
  from 'grommet/components/chart/Chart';
import Legend from 'grommet/components/Legend';
import GraphicSizer from '../../utils/GraphicSizer';
import duration from '../../utils/Duration';

function normalizePrecision (value) {
  return Math.round(value * 10.0) / 10.0;
}

export default class VirtualMachineMetrics extends Component {

  constructor (props) {
    super(props);
    this._onGraphicSize = this._onGraphicSize.bind(this);
    this._onChartActive = this._onChartActive.bind(this);

    this.state = {
      chartData: this._createChartData(props),
      cpuIndex: 0,
      graphicSize: 'small',
      memoryIndex: 0,
      storageIndex: 0
    };
  }

  componentDidMount () {
    const container = ReactDOM.findDOMNode(this.refs.utilizationMeters);
    this._graphicSizer = new GraphicSizer(container, this._onGraphicSize);
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.nav.active !== nextProps.nav.active) {
      // The NavSidebar is changing, relayout when it finishes animating.
      // TODO: Convert to an animation event listener.
      this._graphicSizer.layout();
    }
    this.setState({
      chartData: this._createChartData(nextProps)
    });
  }

  componentDidUpdate () {
    const container = ReactDOM.findDOMNode(this.refs.utilizationMeters);
    this._graphicSizer.reset(container);
  }

  componentWillUnmount () {
    this._graphicSizer.stop();
  }

  _createChartData (props) {
    const { virtualMachine } = props;
    const diskReads = this._chartData(virtualMachine.diskReads);
    const diskWrites = this._chartData(virtualMachine.diskWrites);
    const networkPackets = this._chartData(virtualMachine.networkPackets);
    const networkThroughput = this._chartData(virtualMachine.networkThroughput);
    const networkThroughputMax = Math.max.apply(Math, networkThroughput);
    const xAxis = this._chartXAxis(virtualMachine.diskReads);
    return {
      activeIndex: xAxis.length - 1,
      count: xAxis.length,
      cpuIndex: 0,
      diskReads: diskReads,
      diskWrites: diskWrites,
      memoryIndex: 0,
      networkPackets: networkPackets,
      networkThroughput: networkThroughput,
      networkThroughputMax: networkThroughputMax,
      storageIndex: 0,
      xAxis: xAxis
    };
  }

  _onGraphicSize (size) {
    this.setState({ graphicSize: size });
  }

  _chartData (series=[], colorIndex) {
    // convert [[timestamp, value], ...] -> [value, ...]
    return series.map(datum => datum[1]);
  }

  _chartXAxis (series=[]) {
    const basis = (series.length > 0 ? new Date(series[0][0]) : new Date());
    return series.map((datum, index) => ({
      label: (index ? duration(basis, new Date(datum[0])) : 'now'),
      value: datum[0]
    }), this);
  }

  _onChartActive (index) {
    let chartData = { ...this.state.chartData };
    chartData.activeIndex = index >= 0 ? index : chartData.count - 1;
    this.setState({ chartData: chartData });
  }

  render () {
    const { virtualMachine } = this.props;
    const { chartData, graphicSize } = this.state;

    const cpuData = [
      {value: virtualMachine.cpuUsed || 0, label: 'In use',
        colorIndex: 'accent-1'},
      {value:
        normalizePrecision(virtualMachine.size.vCpus - virtualMachine.cpuUsed),
        label: 'Available', colorIndex: 'unset'}
    ];
    const memoryData = [
      {value: virtualMachine.memoryUsed || 0, label: 'In use',
        colorIndex: 'accent-1'},
      {value:
        normalizePrecision(virtualMachine.size.memory -
          virtualMachine.memoryUsed),
        label: 'Available', colorIndex: 'unset'}
    ];
    const storageData = [
      {value: virtualMachine.diskUsed || 0, label: 'In use',
        colorIndex: 'accent-1'},
      {value:
        normalizePrecision(virtualMachine.size.diskSpace -
          virtualMachine.diskUsed),
        label: 'Available', colorIndex: 'unset'}
    ];

    const storageLegend = (
      <Legend series={[
        { label: 'Reads', colorIndex: 'accent-1',
          value: chartData.diskReads[chartData.activeIndex] },
        { label: 'Writes', colorIndex: 'graph-1',
          value: chartData.diskWrites[chartData.activeIndex] }
      ]} units="kpbs" />
    );
    const networkLegend = (
      <Legend series={[
        { label: 'Packets', colorIndex: 'accent-1',
          value: chartData.networkPackets[chartData.activeIndex] },
        { label: 'Throughput', colorIndex: 'graph-1', units: 'kbps',
          value: chartData.networkThroughput[chartData.activeIndex] }]} />
    );

    return (
      <Box full="horizontal">
        <Section pad="medium" full="horizontal">
          <Heading tag="h2" margin="none">Utilization</Heading>
          <Tiles ref="utilizationMeters" fill={true}>
            <Tile pad="medium">
              <Header size="small" justify="center">
                <Heading tag="h3">CPU</Heading>
              </Header>
              <AnnotatedMeter type="circle" legend={true} units="vCPUs"
                size={graphicSize} max={virtualMachine.size.vCpus}
                series={cpuData} />
            </Tile>
            <Tile pad="medium">
              <Header size="small" justify="center">
                <Heading tag="h3">Memory</Heading>
              </Header>
              <AnnotatedMeter type="circle" legend={true} units="GB"
                size={graphicSize} series={memoryData} />
            </Tile>
            <Tile pad="medium">
              <Header size="small" justify="center">
                <Heading tag="h3">Storage</Heading>
              </Header>
              <AnnotatedMeter type="circle" legend={true} units="GB"
                size={graphicSize} series={storageData} />
            </Tile>
          </Tiles>
        </Section>

        <Section pad="medium" full="horizontal">
          <Heading tag="h2" margin="none">Storage</Heading>
          <Chart vertical={true} full={true}>
            <MarkerLabel count={chartData.count}
              index={chartData.activeIndex} label={storageLegend} />
            <Base width="full" height={this.state.graphicSize} />
            <Layers>
              <Marker vertical={true} colorIndex="graph-2"
                count={chartData.count} index={chartData.activeIndex} />
              <Line values={chartData.diskReads} colorIndex="accent-1" />
              <Line values={chartData.diskWrites} colorIndex="graph-1" />
              <HotSpots count={chartData.count}
                activeIndex={chartData.activeIndex}
                onActive={this._onChartActive} />
            </Layers>
            <Axis count={chartData.count} label={chartData.xAxis} />
          </Chart>
        </Section>

        <Section pad="medium" full="horizontal">
          <Heading tag="h2" margin="none">Network</Heading>
          <Chart vertical={true} full={true}>
            <MarkerLabel count={chartData.count}
              index={chartData.activeIndex} label={networkLegend} />
            <Base width="full" height={this.state.graphicSize} />
            <Layers>
              <Marker vertical={true} colorIndex="graph-2"
                count={chartData.count} index={chartData.activeIndex} />
              <Line values={chartData.networkPackets} colorIndex="accent-1" />
              <Line values={chartData.networkThroughput} colorIndex="graph-1"
                max={chartData.networkThroughputMax} />
              <HotSpots count={chartData.count}
                activeIndex={chartData.activeIndex}
                onActive={this._onChartActive} />
            </Layers>
            <Axis count={chartData.count} label={chartData.xAxis} />
          </Chart>
        </Section>
      </Box>
    );
  }
}

VirtualMachineMetrics.propTypes = {
  nav: PropTypes.object.isRequired,
  virtualMachine: PropTypes.object.isRequired
};
