import { View } from 'react-native';
import Markdown from '@ronradtke/react-native-markdown-display';
import PropTypes from 'prop-types';

const SizedMarkdown = ({ children }) => {
  return (
    <View>
      <Markdown>{children}</Markdown>
    </View>
  );
};

SizedMarkdown.propTypes = {
  children: PropTypes.node,
};

export default SizedMarkdown;
