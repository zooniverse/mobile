import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import FittedImage from '../common/FittedImage';
import SizedMarkdown from '../common/SizedMarkdown';

function ClassifyTutorialStep({ step, mediaUri }) {
  const content = step?.content ?? '';

  return (
    <ScrollView >
      <View style={styles.container}>
        <View style={styles.contentContainer} onLayout={this.onLayout}>
          {mediaUri ? (
            <FittedImage
              maxWidth={400}
              maxHeight={400}
              source={{ uri: mediaUri }}
              onLoad={() => this.setState({ displayStep: true })}
            />
          ) : null}

          <View style={styles.markdown}>
            <SizedMarkdown>{content}</SizedMarkdown>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // borderWidth: 1,
    // borderColor: 'red',
    // flex: 1,
  },
  markdown: {
    // flex: 1,
    marginTop: 15,
  },
  contentContainer: {
    flex: 1,
    margin: 16,
  },
});

export default ClassifyTutorialStep;
