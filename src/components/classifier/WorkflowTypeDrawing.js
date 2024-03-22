import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import ClassifyQuestion from './ClassifyQuestion';
import { useDispatch, useSelector } from 'react-redux';
import ImageSingle from './ImageSingle';
import reactotron from 'reactotron-react-native';
import { useRoute } from '@react-navigation/native';
import DrawableSubject from '../Markings/DrawableSubject';
import { loadImageToCache } from '../../actions/images';

function WorkflowTypeDrawing(props) {
  const route = useRoute();
  const dispatch = useDispatch();
  const { subject } = useSelector((state) => state.classifier);
  const tool = route?.params?.tools ?? [];
  reactotron.log({ route });
  reactotron.log({ props });
  const displays = subject?.displays ?? [];
  const [imgSrc, setImgSrc] = useState();

  useEffect(() => {
    reactotron.log('use effect')
    putImageInLocalStorage();
  }, []);

  const putImageInLocalStorage = async () => {
    reactotron.log('get img', displays);
    if (Array.isArray(displays) && displays.length > 0 && displays[0]?.src) {
      reactotron.log('load to cache', displays[0].src)
      // loadImageToCache(displays[0].src)
        // .then((res) => reactotron.log('res', res))
        // .catch((err) => reactotron.log('error'));
      // reactotron.log({cachedImage})
      dispatch(loadImageToCache(subject.displays[0].src)).then(localImagePath => {
        reactotron.log({ localImagePath })
        setImgSrc(localImagePath)
        // if (Platform.OS === 'android') {
        //     // This isn't using the cache because Image.getSize can't fetch from a local
        //     // path on Android. We tried EVERYTHING.
        //     Image.getSize(subject.displays[0].src, (width, height) => {
        //         this.props.classifierActions.setSubjectSizeInWorkflow(subject.id, {width, height})
        //     })
        // } else {    //this is the appropriate behavior. It's just broken on Android right now.
        //     Image.getSize(localImagePath, (width, height) => {
        //         this.props.classifierActions.setSubjectSizeInWorkflow(subject.id, {width, height})
        //     })
        // }

        // this.setState({
        //     imageIsLoaded: true,
        //     localImagePath
        // })
    })
    }
  };

  // you need to load the image into cache
  //  pass the image source into the single image instead of displays, do this for the others too

  // const customFullScreen = (
  //   <DrawableSubject
  //     tool={tool}
  //     visible={this.state.isModalVisible}
  //     inMuseumMode={this.props.route.params.project.in_museum_mode}
  //     imageSource={this.state.localImagePath}
  //     onClose={() =>
  //       this.setState({ isModalVisible: false, modalHasBeenClosedOnce: true })
  //     }
  //     warnForRequirements={this.state.modalHasBeenClosedOnce}
  //   />
  // );
  return imgSrc ? (
    <View style={styles.container}>
      <ClassifyQuestion question={props.task?.instruction} />
      <ImageSingle displays={displays} putImageInLocalStorage={putImageInLocalStorage } />
    </View>
  ) : null;
}

const styles = StyleSheet.create({
  container: {},
});

export default WorkflowTypeDrawing;
