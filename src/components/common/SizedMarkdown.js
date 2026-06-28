import React, { useState } from 'react';
import { View, Image } from 'react-native';
import Markdown from '@ronradtke/react-native-markdown-display';
import PropTypes from 'prop-types';
import DeviceInfo from 'react-native-device-info';

const SizedMarkdown = ({ children, style, forButton }) => {
  const isTablet = DeviceInfo.isTablet();
  const [viewDimensions, setViewDimensions] = useState({ width: 0, height: 0 });

  const onViewLayout = ({ nativeEvent }) => {
    setViewDimensions({
      width: nativeEvent.layout.width,
      height: nativeEvent.layout.width
    });
  };

  const addLineBreak = (content) => {
    return content ? content.replace(/\n/g, (n) => n + n) : content;
  };

  const preprocessMarkdown = (text) => {
    if (!text) return text;
    // Strip markdown-it-imsize sizing hints (`=200x300`, `=200x`, `=x300`,
    // `=200`) from image syntax. The previous regex required digits before
    // the `x` and silently failed on height-only forms like `=x200`, which
    // left the literal hint in the URL and broke the markdown parse.
    return text.replace(
      /!\[([^\]]*)\]\(([^\s)]+)\s*=[\dxX]+\)/g,
      '![$1]($2)'
    );
  };

  const fontSize = isTablet ? 22 : 14;

  // We limit the width and height so any button images
  const buttonImageHeight = Math.min(viewDimensions.height, 50);
  const buttonImageWidth = Math.min(viewDimensions.width, 50);

  const markdownStyles = {
    body: {
      fontFamily: 'Karla',
      fontSize: fontSize,
      fontWeight: isTablet ? 'bold' : 'normal',
      color: 'black',
      ...style,
    },
    text: {
      fontFamily: 'Karla',
      fontSize: fontSize,
      fontWeight: isTablet ? 'bold' : 'normal',
      color: 'black',
      ...style,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    image: {
      width: forButton ? buttonImageWidth : viewDimensions.width,
      height: forButton ? buttonImageHeight : viewDimensions.height,
      resizeMode: 'contain',
      marginRight: 10,
    },
  };

  // Custom render rules to handle images without spinner
  const renderRules = {
    image: (node, children, parent, styles, inheritedStyles = {}) => {
      const { src, alt } = node.attributes;
      return (
        <Image
          key={`img-${src}`}
          source={{ uri: src }}
          style={{
            width: forButton ? buttonImageWidth : viewDimensions.width,
            height: forButton ? buttonImageHeight : viewDimensions.height,
            resizeMode: 'contain',
            marginRight: 10,
          }}
          onError={(error) => {
            console.log('Image load error:', src, error.nativeEvent);
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', src);
          }}
        />
      );
    },
  };

  const processedContent = addLineBreak(preprocessMarkdown(children));

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }} onLayout={onViewLayout}>
      <Markdown
        style={markdownStyles}
        rules={renderRules}
      >
        {processedContent}
      </Markdown>
    </View>
  );
};

SizedMarkdown.propTypes = {
  children: PropTypes.string,
  style: PropTypes.object,
  forButton: PropTypes.bool,
};

export default SizedMarkdown;