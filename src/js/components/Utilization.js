// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { loadUtilization, unloadUtilization, navActivate
  } from '../actions/actions';
import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Header from 'grommet/components/Header';
import Paragraph from 'grommet/components/Paragraph';
import Footer from 'grommet/components/Footer';
import Box from 'grommet/components/Box';
import Form from 'grommet/components/Form';
import FormFields from 'grommet/components/FormFields';
import FormField from 'grommet/components/FormField';
import Title from 'grommet/components/Title';
import Search from 'grommet/components/Search';
import Distribution from 'grommet/components/Distribution';
import Legend from 'grommet/components/Legend';
import Query from 'grommet-addons/utils/Query';
import NavControl from './NavControl';

const CATEGORY = 'virtual-machines';

const ATTRIBUTE_LABEL = {
  cpuUtilization: 'CPU %',
  diskUsed: 'Disk used',
  diskUtilization: 'Disk %',
  memoryUsed: 'Memory used',
  memoryUtilization: 'Memory %'
};

const ATTRIBUTE_UNITS = {
  cpuUtilization: '% cpu',
  diskUsed: 'GB',
  diskUtilization: '% disk',
  memoryUsed: 'GB',
  memoryUtilization: '% mem'
};

const THRESHOLDS = [
  { label: '90% or more', value: 90, colorIndex: 'accent-1' },
  { label: '40% or more', value: 40, colorIndex: 'graph-1' },
  { label: 'less than 40%', value: 0, colorIndex: 'unset' }
];

const FooterForm = props => {
  return (
    <Form compact={true}>
      <FormFields>
        <fieldset>
          {props.children}
        </fieldset>
      </FormFields>
    </Form>
  );
};

class Utilization extends Component {

  constructor (props) {
    super(props);

    this._onClickTitle = this._onClickTitle.bind(this);
    this._onCloseNav = this._onCloseNav.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this._onClickItem = this._onClickItem.bind(this);
    this._onChangeArea = this._onChangeArea.bind(this);
    this._onChangeColor = this._onChangeColor.bind(this);
    this._onResize = this._onResize.bind(this);
    this._layout = this._layout.bind(this);
    this._reset = this._reset.bind(this);

    this._setDocumentTitle(props);
    this.state = this._stateFromProps(props, new Query(''));
  }

  componentDidMount () {
    // don't load utilization until we know how many we need
    window.addEventListener('resize', this._onResize);
    this._onResize();
  }

  componentWillReceiveProps (nextProps) {
    this._setDocumentTitle(nextProps);
    this.setState(this._stateFromProps(nextProps, this.state.query),
      () => {
        if (nextProps.areaAttribute !== this.props.areaAttribute) {
          this._reset();
        }
      });
  }

  componentWillUnmount () {
    this.props.dispatch(unloadUtilization());
    window.removeEventListener('resize', this._onResize);
  }

  _stateFromProps (props, query) {
    const { utilization: {result: {items}} } = props;
    const areaAttribute =
      (this.state && this.state.areaAttribute ? this.state.areaAttribute :
        props.areaAttribute);
    const colorAttribute =
      (this.state && this.state.colorAttribute ? this.state.colorAttribute :
        props.colorAttribute);
    let total = 0;
    const series = items.map((item, index) => {
      const areaValue = item[areaAttribute] ||
        item.attributes[areaAttribute] || 0;
      const colorValue = item[colorAttribute] ||
        item.attributes[colorAttribute] || 0;
      total += areaValue;
      let colorIndex;
      for (let i=0; i<THRESHOLDS.length; i++) {
        if (colorValue >= THRESHOLDS[i].value) {
          colorIndex = THRESHOLDS[i].colorIndex;
          break;
        }
      }
      return {
        colorIndex: colorIndex,
        label: (
          <div>
            <div>
              <strong>
                {`${colorValue} ${ATTRIBUTE_UNITS[colorAttribute]}`}
              </strong>
            </div>
            <span>{item.name}</span>
          </div>
        ),
        labelValue: areaValue,
        onClick: this._onClickItem.bind(this, item.uri),
        value: areaValue
      };
    });
    total = Math.round(total * 100) / 100.0;

    return {
      areaAttribute: areaAttribute,
      colorAttribute: colorAttribute,
      count: 10,
      query: query,
      series: series,
      total: total
    };
  }

  _setDocumentTitle (props) {
    document.title = `Utilization - ${props.instanceName || ''}`;
  }

  _reset () {
    this.props.dispatch(loadUtilization(this.state.areaAttribute,
      this.state.count, this.state.query));
  }

  _onResize () {
    // debounce
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(this._layout, 50);
  }

  _layout () {
    const element = ReactDOM.findDOMNode(this.refs.distribution);
    if (element) {
      const rect = element.getBoundingClientRect();
      // const height = window.innerHeight - rect.top;
      // sectionElement.style.height = height.toString(10) + 'px';
      // 50000 was empirically determined
      const count = Math.round((rect.width * rect.height) / 45000);
      if (count !== this.state.count) {
        this.setState({ count: count }, this._reset);
      }
    }
  }

  _onClickTitle () {
    this.props.dispatch(navActivate(true));
  }

  _onCloseNav () {
    this.props.dispatch(navActivate(false));
  }

  _onSearch (event) {
    const searchText = event.target.value;
    this.setState({ query: new Query(searchText) });
    // debounce
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(this._reset, 200);
  }

  _onClickItem (uri) {
    const { router } = this.context;
    router.push(`/${CATEGORY}${uri}`);
  }

  _onChangeArea (event) {
    this.setState({ areaAttribute: event.target.value }, this._reset);
  }

  _onChangeColor (event) {
    // no need to reset when color changes
    this.setState({ colorAttribute: event.target.value }, this._reset);
  }

  _renderHeader () {
    const areaLabel = ATTRIBUTE_LABEL[this.state.areaAttribute].toLowerCase();
    const colorLabel = ATTRIBUTE_LABEL[this.state.colorAttribute].toLowerCase();

    return (
      <Paragraph margin="none">
        Showing the top virtual machine utilization
        of <strong>{areaLabel}</strong> as area
        and <strong>{colorLabel}</strong> as color.
      </Paragraph>
    );
  }

  _renderFooter () {
    const series = THRESHOLDS.map(threshold => ({
      label: threshold.label,
      colorIndex: threshold.colorIndex
    }));
    return (
      <Footer pad={{
        horizontal: 'medium', vertical: 'medium', between: 'medium' }}
        justify="between" responsive={true}>
        <Legend series={series} />
        <Box direction="row">
          <FooterForm>
            <FormField label="Area">
              <select value={this.state.areaAttribute}
                onChange={this._onChangeArea}>
                <option value="memoryUsed">{ATTRIBUTE_LABEL.memoryUsed}</option>
                <option value="diskUsed">{ATTRIBUTE_LABEL.diskUsed}</option>
              </select>
            </FormField>
          </FooterForm>
          <FooterForm>
            <FormField label="Color">
              <select value={this.state.colorAttribute}
                onChange={this._onChangeColor}>
                <option value="cpuUtilization">
                  {ATTRIBUTE_LABEL.cpuUtilization}
                </option>
                <option value="memoryUtilization">
                  {ATTRIBUTE_LABEL.memoryUtilization}
                </option>
                <option value="diskUtilization">
                  {ATTRIBUTE_LABEL.diskUtilization
                  }</option>
              </select>
            </FormField>
          </FooterForm>
        </Box>
      </Footer>
    );
  }

  render () {
    const header = this._renderHeader();
    const footer = this._renderFooter();

    return (
      <Article pad="none" primary={true} full="vertical">
        <Header direction="row" justify="between" size="large"
          pad={{ horizontal: 'medium', between: 'small' }}>
          <Title responsive={false}>
            <NavControl />
            <span>Utilization</span>
          </Title>
          <Search inline={true} fill={true} size="medium" placeHolder="Search"
            value={this.state.query.toString()} onDOMChange={this._onSearch} />
        </Header>
        <Section pad={{horizontal: 'medium', between: 'small'}} flex={true}>
          {header}
          <Box flex={true}>
            <Distribution ref="distribution"
              series={this.state.series} size="full"
              units={ATTRIBUTE_UNITS[this.state.areaAttribute]} />
          </Box>
        </Section>
        {footer}
      </Article>
    );
  }

}

Utilization.propTypes = {
  areaAttribute: PropTypes.string,
  colorAttribute: PropTypes.string,
  index: PropTypes.object,
  instanceName: PropTypes.string,
  search: PropTypes.object
};

Utilization.contextTypes = {
  router: PropTypes.object
};

let select = (state, props) => {
  return {
    areaAttribute: props.location.query.area || 'memoryUsed',
    colorAttribute: props.location.query.color || 'cpuUtilization',
    instanceName: state.settings.settings.name,
    nav: state.nav,
    search: state.search,
    utilization: state.utilization
  };
};

export default connect(select)(Utilization);
