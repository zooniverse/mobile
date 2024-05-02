import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';

import Icon from 'react-native-vector-icons/Fontisto';
import PropTypes from 'prop-types';
import { BlurView } from '@react-native-community/blur';

import FontedText from '../common/FontedText';

const FeedbackModal = ({ correct = false, message = '', onClose = false }) => {
  const onClosePressed = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      onRequestClose={onClosePressed}
    >
      <View style={styles.container}>
        <BlurView blurType="dark" blurAmount={3} style={styles.blur} />
        <View style={styles.innerContainer}>
          <View style={styles.titleCloseContainer}>
            <FontedText style={styles.modalText}>
              {correct ? 'NICELY DONE' : 'NOT QUITE'}
            </FontedText>
            <TouchableOpacity onPress={onClosePressed}>
              <Icon name="close" style={styles.icon} size={18} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <FontedText style={styles.text}>{message}</FontedText>
          </View>
          <TouchableOpacity
            style={styles.answerButtonContainer}
            onPress={onClosePressed}
          >
            <FontedText style={styles.answerButtonText}>
              {correct ? 'Correct!' : 'Incorrect'}
            </FontedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  answerButtonContainer: {
    marginTop: 24,
    width: 190,
    borderRadius: 32,
    backgroundColor: '#005D69',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.05,
  },
  blur: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  hitsText: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    fontWeight: '500',
  },
  icon: {
    color: '#005D69',
  },
  innerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignSelf: 'stretch',
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.05,
    color: '#005D69',
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500',
    color: '#000',
    lineHeight: 18.7,
  },
  titleCloseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
});

FeedbackModal.propTypes = {
  correct: PropTypes.bool,
  message: PropTypes.string,
  onClose: PropTypes.func || PropTypes.bool,
};

export default FeedbackModal;
