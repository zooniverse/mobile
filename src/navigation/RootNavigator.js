import * as React from 'react';
import {View, Text} from 'react-native';

import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import PageKeys from '../constants/PageKeys';
import SignIn from '../components/SignIn';
import ProjectDisciplines from '../components/ProjectDisciplines';
import PublicationList from '../components/PublicationList';
import About from '../components/About';
import ProjectList from '../components/projects/ProjectList';
import Register from '../components/Register';
import Settings from '../components/settings/Settings';
import ZooWebView from '../components/ZooWebView';
import SwipeClassifier from '../components/classifier/SwipeClassifier';
import WebViewScreen from '../components/WebViewScreen';
import DrawingClassifier from '../components/Markings/DrawingClassifier';
import QuestionClassifier from '../components/classifier/QuestionClassifier';
import MultiAnswerClassifier from '../components/classifier/MultiAnswerClassifier';
import ZooniverseApp from '../containers/zooniverseApp';
import SideDrawerContent from '../components/SideDrawerContent';
import NavBar from '../components/NavBar';
import {useDispatch} from 'react-redux';
import {setPageShowing} from '../actions/navBar';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
export const navRef = createNavigationContainerRef();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={PageKeys.ZooniverseApp}
      screenOptions={{
        header: ({ navigation }) => <NavBar navigation={navigation} />,
        gestureEnabled: false
      }}
      headerMode="float">
      <Stack.Screen
        name={PageKeys.SignIn}
        component={SignIn}
        duration={0}
        type="reset"
      />
      <Stack.Screen
        name={PageKeys.ZooniverseApp}
        component={ZooniverseApp}
      />
      <Stack.Screen
        name={PageKeys.ProjectDisciplines}
        component={ProjectDisciplines}
      />
      <Stack.Screen name={PageKeys.About} component={About} />
      <Stack.Screen name={PageKeys.Publications} component={PublicationList} />
      <Stack.Screen name={PageKeys.ProjectList} component={ProjectList} />
      <Stack.Screen name={PageKeys.Register} component={Register} />
      <Stack.Screen name={PageKeys.Settings} component={Settings} />
      <Stack.Screen
        name={PageKeys.ZooWebView}
        component={ZooWebView}
        duration={0}
      />
      <Stack.Screen
        name={PageKeys.SwipeClassifier}
        component={SwipeClassifier}
        panHandlers={null}
      />
      <Stack.Screen name={PageKeys.WebView} component={WebViewScreen} />
      <Stack.Screen
        name={PageKeys.DrawingClassifier}
        drawerLockMode={'locked-closed'}
        panHandlers={null}
        component={DrawingClassifier}
      />
      <Stack.Screen
        name={PageKeys.QuestionClassifier}
        component={QuestionClassifier}
      />
      <Stack.Screen
        name={PageKeys.MultiAnswerClassifier}
        component={MultiAnswerClassifier}
      />
    </Stack.Navigator>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerPosition: 'right',
        headerShown: false,
        headerMode: 'float',
        swipeEnabled: true,
        swipeEdgeWidth: 0, // These 2 swipe options allow the drawer to be swiped closed but NOT swiped open.
      }}
      drawerContent={props => <SideDrawerContent {...props} />}>
      <Drawer.Screen name="stack" component={StackNavigator} />
    </Drawer.Navigator>
  );
};

const RootNavigator = () => {
  const dispatch = useDispatch();
  return (
    <NavigationContainer
      ref={navRef}
      onStateChange={() => {
        const newRoute = navRef.getCurrentRoute();
        dispatch(setPageShowing(newRoute.name));
      }}>
      <DrawerNavigator />
    </NavigationContainer>
  );
};

export default RootNavigator;
