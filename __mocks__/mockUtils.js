import React from 'react'
import PropTypes from 'prop-types';

// Create a mock component
export const createMockComponent = function (name) {
    return class extends React.Component {
      static displayName = name
  
      static propTypes = {
        children: PropTypes.node
      }
  
      render() {
        const type = name[0] + name.substr(1);
        return React.createElement(type, this.props, this.props.children);
      }
    };
};
