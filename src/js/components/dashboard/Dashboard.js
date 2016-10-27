// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { loadDashboard, unloadDashboard, searchSuggestions, navActivate,
  selectIndex, showUtilization } from '../../actions/actions';
import Article from 'grommet/components/Article';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Section from 'grommet/components/Section';
import Search from 'grommet/components/Search';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';
import AnnotatedMeter from 'grommet-addons/components/AnnotatedMeter';
import Box from 'grommet/components/Box';
import NavControl from '../NavControl';
import Notifications from '../Notifications';
import DashboardTasks from './DashboardTasks';
import GraphicSizer from '../../utils/GraphicSizer';

const CATEGORY_LABELS = {
  alerts: 'Alert',
  images: 'Image',
  networks: 'Network',
  'os-types': 'OS Type',
  tasks: 'Task',
  'virtual-machines': 'Virtual Machine',
  'virtual-machine-sizes': 'Size'
};

class Suggestion extends Component {
  render () {
    return (
      <Box direction="row" justify="between">
        <span>{this.props.name}</span>
        <label className="secondary">
          {CATEGORY_LABELS[this.props.category] || this.props.category}
        </label>
      </Box>
    );
  }
}

Suggestion.propTypes = {
  name: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired
};

class Dashboard extends Component {

  constructor (props) {
    super(props);

    this._onClickTitle = this._onClickTitle.bind(this);
    this._onCloseNav = this._onCloseNav.bind(this);
    this._onSearchChange = this._onSearchChange.bind(this);
    this._onSearchSelect = this._onSearchSelect.bind(this);
    this._onClickUtilization = this._onClickUtilization.bind(this);
    this._onGraphicSize = this._onGraphicSize.bind(this);

    this._setDocumentTitle(props);
    this.state = { graphicSize: 'small',
      cpuIndex: 0, memoryIndex: 0, storageIndex: 0 };
  }

  componentDidMount () {
    this.props.dispatch(loadDashboard());
    const container = ReactDOM.findDOMNode(this.refs.utilizationMeters);
    this._graphicSizer = new GraphicSizer(container, this._onGraphicSize);
  }

  componentWillReceiveProps(nextProps) {
    this._setDocumentTitle(nextProps);
    // if (this.props.nav.active !== nextProps.nav.active) {
    //   // The NavSidebar is changing, relayout when it finishes animating.
    //   // TODO: Convert to an animation event listener.
    //   this._graphicSizer.layout();
    // }
    const suggestions = nextProps.search.suggestions.map((suggestion) => {
      return {
        suggestion: suggestion,
        label: (
          <Suggestion name={suggestion.name} category={suggestion.category} />
        )
      };
    });
    this.setState({ suggestions: suggestions });
  }

  componentWillUnmount () {
    this.props.dispatch(unloadDashboard());
    this._graphicSizer.stop();
  }

  _setDocumentTitle (props) {
    document.title = `Dashboard - ${props.instanceName || ''}`;
  }

  _onClickTitle () {
    this.props.dispatch(navActivate(true));
  }

  _onCloseNav () {
    this.props.dispatch(navActivate(false));
  }

  _onSearchChange (event) {
    this.props.dispatch(searchSuggestions(event.target.value));
  }

  _onSearchSelect (pseudoEvent) {
    const suggestion = pseudoEvent.suggestion.suggestion;
    this.props.dispatch(selectIndex('/' + suggestion.category, suggestion.uri));
  }

  _onClickUtilization (attribute) {
    this.props.dispatch(showUtilization(attribute));
  }

  _onGraphicSize (size) {
    this.setState({ graphicSize: size });
  }

  render () {
    const { dashboard, search } = this.props;

    let tasks;
    if (dashboard.tasks.count > 0) {
      tasks = (
        <Section pad="medium" full="horizontal">
          <Heading tag="h2">Running Tasks</Heading>
          <DashboardTasks tasks={dashboard.tasks} />
        </Section>
      );
    }

    let cpuData = [
      {value: 58, label: 'In use', colorIndex: 'accent-1',
        onClick: this._onClickUtilization.bind(this, 'memoryUsed')},
      {value: 42, label: 'Available', colorIndex: 'unset'}
    ];

    let memoryData = [
      {value: 127, label: 'In use', colorIndex: 'accent-1',
        onClick: this._onClickUtilization.bind(this, 'memoryUsed')},
      {value: 73, label: 'Available', colorIndex: 'unset'}
    ];

    let storageData = [
      {value: 427, label: 'In use', colorIndex: 'accent-1',
        onClick: this._onClickUtilization.bind(this, 'diskUsed')},
      {value: 573, label: 'Available', colorIndex: 'unset'}
    ];

    return (
      <Article ref="content" pad="none">
        <Header direction="row" justify="between" size="large"
          pad={{ horizontal: 'medium', between: 'small' }}>
          <NavControl />
          <Search ref="search" inline={true} responsive={false} fill={true}
            size="medium" placeHolder="Search"
            defaultValue={search.text} onDOMChange={this._onSearchChange}
            onSelect={this._onSearchSelect}
            suggestions={this.state.suggestions} />
        </Header>
        <Notifications context={{global: true}} includeResource={true}
          includeCategories="alerts" />
        <Section key="utilization" pad="medium" full="horizontal">
          <Header justify="between">
            <Heading tag="h2" margin="none">Utilization</Heading>
          </Header>
          <Tiles ref="utilizationMeters" fill={true}>
            <Tile pad="medium">
              <Header size="small" justify="center">
                <Heading tag="h3">CPU</Heading>
              </Header>
              <AnnotatedMeter type="circle" legend={true} units="GHz"
                size={this.state.graphicSize} series={cpuData} />
            </Tile>
            <Tile pad="medium">
              <Header size="small" justify="center">
                <Heading tag="h3">Memory</Heading>
              </Header>
              <AnnotatedMeter type="circle" legend={true} units="GB"
                size={this.state.graphicSize} series={memoryData} />
            </Tile>
            <Tile pad="medium">
              <Header size="small" justify="center">
                <Heading tag="h3">Storage</Heading>
              </Header>
              <AnnotatedMeter type="circle" legend={true} units="TB"
                size={this.state.graphicSize} series={storageData} />
            </Tile>
          </Tiles>
        </Section>
        {tasks}
      </Article>
    );
  }

}

Dashboard.propTypes = {
  dashboard: PropTypes.object,
  search: PropTypes.object
};

let select = (state, props) => ({
  dashboard: state.dashboard,
  search: state.search
});

export default connect(select)(Dashboard);
