import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PropTypes from 'prop-types';

import FontedText from '../common/FontedText';

function ButtonsDrawing({ canUndo, onUndo, onDelete, onDraw }) {
  const [drawActive, setDrawActive] = useState(true);

  const drawContainer = drawActive
    ? styles.btnContainerActive
    : styles.btnContainerInactive;
  const drawText = drawActive ? styles.btnTextActive : styles.btnTextInactive;
  const deleteContainer = !drawActive
    ? styles.btnContainerActive
    : styles.btnContainerInactive;
  const deleteText = !drawActive
    ? styles.btnTextActive
    : styles.btnTextInactive;

  const deletedPressed = () => {
    setDrawActive(false);
    onDelete();
  };

  const drawPressed = () => {
    setDrawActive(true);
    onDraw();
  };

  const UndoFont = () => (
    <FontAwesome5
      name={'undo'}
      color={canUndo ? '#000000' : '#CBCCCB'}
      size={16}
    />
  );
  return (
    <View style={styles.container}>
      {canUndo ? (
        <TouchableOpacity
          style={[styles.btn, styles.undoContainer]}
          onPress={onUndo}
        >
          <UndoFont />
        </TouchableOpacity>
      ) : (
        <View style={[styles.btn, styles.undoContainer]}>
          <UndoFont />
        </View>
      )}

      <TouchableOpacity
        style={[styles.btn, styles.deleteContainer, deleteContainer]}
        onPress={deletedPressed}
      >
        <FontAwesome name={'trash-o'} style={deleteText} size={18} />
        <FontedText style={[styles.text, deleteText]}>Delete</FontedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.drawContainer, drawContainer]}
        onPress={drawPressed}
      >
        <MaterialCommunityIcons
          name="vector-rectangle"
          style={drawText}
          size={22}
        />
        <FontedText style={[styles.text, drawText]}>Draw</FontedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 40,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  btnContainerActive: {
    backgroundColor: '#005D69',
  },
  btnContainerInactive: {
    backgroundColor: '#fff',
  },
  btnTextActive: {
    color: '#fff',
  },
  btnTextInactive: {
    color: '#A6A7A9',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
  deleteContainer: {
    maxWidth: 214,
    flex: 1,
    flexDirection: 'row',
  },
  drawContainer: {
    maxWidth: 400,
    flex: 1,
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 18.7,
    letterSpacing: 0.5,
    paddingLeft: 8,
  },
  textDelete: {
    color: '#A6A7A9',
    paddingLeft: 8,
  },
  textDraw: {
    color: '#fff',
    paddingLeft: 8,
  },
  undoContainer: {
    width: 40,
    backgroundColor: '#fff',
  },
});

ButtonsDrawing.propTypes = {
  canUndo: PropTypes.bool,
  onUndo: PropTypes.func,
  onDelete: PropTypes.func,
  onDraw: PropTypes.func,
};

export default ButtonsDrawing;
