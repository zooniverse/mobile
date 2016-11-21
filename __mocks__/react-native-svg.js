import React from 'react'

// Create a vanilla SVG component
const createComponent = function (name) {
  return class extends React.Component {
    static displayName =name

    static propTypes = {
      children: React.PropTypes.node
    }

    render() {
      const type = name[0].toLowerCase() + name.substr(1);
      return React.createElement(type, this.props, this.props.children);
    }
  };
};

const Svg = createComponent('Svg')
const Path = createComponent('Path')

export {
  Svg,
  Path,
}

export default Svg
