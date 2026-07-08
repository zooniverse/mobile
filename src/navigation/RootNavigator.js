import * as React from 'react';

import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import PageKeys from '../constants/PageKeys';
import SignIn from '../components/SignIn';
import ProjectDisciplines from '../components/ProjectDisciplines';
import About from '../components/About';
import ProjectList from '../components/projects/ProjectList';
import Register from '../components/Register';
import Settings from '../components/settings/Settings';
import SwiperClassifier from '../components/classifier/Swiper/SwiperClassifier';
import DrawingClassifier from '../components/Markings/DrawingClassifier';
import QuestionClassifier from '../components/classifier/QuestionClassifier';
import MultiAnswerClassifier from '../components/classifier/MultiAnswerClassifier';
import ClassifierScreen from '../components/classifier/ClassifierScreen';
import ZooniverseApp from '../containers/zooniverseApp';
import SideDrawerContent from '../components/SideDrawerContent';
import NavBar from '../components/NavBar';
import {useDispatch} from 'react-redux';
import {setPageShowing} from '../actions/navBar';
import NotificationLandingPageScreen from '../components/NotificationLandingPageScreen';
import { gaTrackScreen } from './screenTracking';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
export const navRef = createNavigationContainerRef();
const pendingNavigationActions = [];

export const navigateWhenReady = (name, params) => {
  if (navRef.isReady()) {
    navRef.navigate(name, params);
    return;
  }

  pendingNavigationActions.push({ name, params });
};

const flushPendingNavigationActions = () => {
  while (pendingNavigationActions.length > 0 && navRef.isReady()) {
    const { name, params } = pendingNavigationActions.shift();
    navRef.navigate(name, params);
  }
};

const StackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={PageKeys.ZooniverseApp}
      screenOptions={{
        header: ({ navigation }) => <NavBar navigation={navigation} />,
        gestureEnabled: false
      }}>
      <Stack.Screen
        name={PageKeys.SignIn}
        component={SignIn}
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
      <Stack.Screen name={PageKeys.ProjectList} component={ProjectList} />
      <Stack.Screen name={PageKeys.Register} component={Register} />
      <Stack.Screen name={PageKeys.Settings} component={Settings} />
      <Stack.Screen
        name={PageKeys.SwipeClassifier}
        component={SwiperClassifier}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={PageKeys.DrawingClassifier}
        component={DrawingClassifier}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={PageKeys.QuestionClassifier}
        component={QuestionClassifier}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={PageKeys.MultiAnswerClassifier}
        component={MultiAnswerClassifier}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={PageKeys.ClassifierScreen}
        component={ClassifierScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={PageKeys.NotificationLandingPageScreen}
        component={NotificationLandingPageScreen}
      />
    </Stack.Navigator>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerPosition: 'right',
        drawerType: 'front',
        headerShown: false,
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
      onReady={flushPendingNavigationActions}
      onStateChange={() => {
        const newRoute = navRef.getCurrentRoute();
        gaTrackScreen(newRoute)
        // Make sure the newRoute has a name.
        if (newRoute?.name) {
          dispatch(setPageShowing(newRoute.name));
        }
      }}>
      <DrawerNavigator />
    </NavigationContainer>
  );
};

export default RootNavigator;
