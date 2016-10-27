// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

/*
 * Adjust Meter and Chart sizes so they fit better.
 */

export default class GraphicSizer {

  constructor (container, listener) {
    this._onResize = this._onResize.bind(this);
    this.layout = this.layout.bind(this);

    this.state = {
      container: container,
      listener: listener,
      timer: null,
      size: 'small'
    };

    window.addEventListener('resize', this._onResize);
    this.layout();
  }

  reset (container) {
    this.state.container = container;
    this.layout();
  }

  stop () {
    clearTimeout(this.state.timer);
    window.removeEventListener('resize', this._onResize);
  }

  _onResize () {
    // debounce
    clearTimeout(this.state.timer);
    this.state.timer = setTimeout(this.layout, 50);
  }

  layout () {
    const { container } = this.state;
    if (container) {
      let rect = container.getBoundingClientRect();
      let children = container.childNodes;
      let graphicWidth = rect.width / children.length;
      let size;
      if (rect.width > 600) {
        if (graphicWidth > 300) {
          size = 'medium';
        } else if (graphicWidth > 200) {
          size = 'small';
        } else {
          size = 'xsmall';
        }
      } else {
        size = 'small';
      }
      if (size !== this.state.size) {
        this.state.size = size;
        this.state.listener(size);
      }
    }
  }
};
