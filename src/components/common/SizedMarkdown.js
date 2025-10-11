import { View, Image } from 'react-native';
import Markdown from '@ronradtke/react-native-markdown-display';
import PropTypes from 'prop-types';
import DeviceInfo from 'react-native-device-info';
import React from 'react';

const SizedMarkdown = ({ children, style, forButton }) => {
  const isTablet = DeviceInfo.isTablet();
  
  const addLineBreak = (content) => {
    return content ? content.replace(/\n/g, (n) => n + n) : content;
  };

  const preprocessMarkdown = (text) => {
    if (!text) return text;
    return text.replace(
      /!\[([^\]]*)\]\(([^\s)]+)\s*=\d+[xX]\d*\)/g,
      '![$1]($2)'
    );
  };

  const fontSize = isTablet ? 22 : 14;
  
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
      width: forButton ? 50 : 60,
      height: forButton ? 50 : 60,
      resizeMode: 'contain',
      marginRight: 10,
    },
  };

  // Custom render rules to handle images without spinner
  const renderRules = {
    image: (node, children, parent, styles, inheritedStyles = {}) => {
      const { src, alt } = node.attributes;
      
      console.log('Rendering image:', src);
      
      return (
        <Image
          key={`img-${src}`}
          source={{ uri: src }}
          style={{
            width: forButton ? 50 : 60,
            height: forButton ? 50 : 60,
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
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
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