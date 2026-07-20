import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useDispatch, useSelector} from 'react-redux';
import {ActivityIndicator, View, Text} from 'react-native';
import {restoreSession} from '../redux/authSlice';
import {fetchAll} from '../redux/progressSlice';
import {RootState, AppDispatch} from '../redux';
import {colors} from '../theme/colors';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen    from '../screens/LoginScreen';
import SignupScreen   from '../screens/SignupScreen';
import TaskScreen     from '../screens/TaskScreen';
import HistoryScreen  from '../screens/HistoryScreen';
import ProfileScreen  from '../screens/ProfileScreen';

export type RootStackParams = {
  Onboarding: undefined;
  AuthStack: undefined;
  AppTabs: undefined;
};
export type AuthStackParams = {
  Login:  undefined;
  Signup: undefined;
};
export type TabParams = {
  Task:    undefined;
  History: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParams>();
const Auth  = createNativeStackNavigator<AuthStackParams>();
const Tab   = createBottomTabNavigator<TabParams>();

const TAB_ICONS: Record<string, string> = { Task:'⚔️', History:'📋', Profile:'👤' };
const TAB_LABELS: Record<string, string> = { Task:'Aufgaben', History:'Verlauf', Profile:'Profil' };

function TabIcon({name, color, focused}: {name:string; color:string; focused:boolean}) {
  return (
    <View style={{alignItems:'center', justifyContent:'center', paddingTop:4}}>
      <Text style={{fontSize:focused?22:18}}>{TAB_ICONS[name]}</Text>
    </View>
  );
}

function AuthStack() {
  return (
    <Auth.Navigator screenOptions={{headerShown:false, contentStyle:{backgroundColor:colors.bg}}}>
      <Auth.Screen name="Login"  component={LoginScreen}/>
      <Auth.Screen name="Signup" component={SignupScreen}/>
    </Auth.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({color, focused}) => <TabIcon name={route.name} color={color} focused={focused}/>,
        tabBarStyle: {
          backgroundColor: colors.bg2,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 4,
        },
        tabBarActiveTintColor:   colors.gold,
        tabBarInactiveTintColor: colors.text3,
        tabBarLabel: TAB_LABELS[route.name] || route.name,
        tabBarLabelStyle: {fontSize:10, fontWeight:'700'},
      })}>
      <Tab.Screen name="Task"    component={TaskScreen}/>
      <Tab.Screen name="History" component={HistoryScreen}/>
      <Tab.Screen name="Profile" component={ProfileScreen}/>
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const user     = useSelector((s:RootState) => s.auth.user);
  const [ready, setReady] = React.useState(false);

  useEffect(() => {
    dispatch(restoreSession()).finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (user) dispatch(fetchAll());
  }, [user]);

  if (!ready) return (
    <View style={{flex:1, alignItems:'center', justifyContent:'center', backgroundColor:colors.bg}}>
      <Text style={{fontSize:48, marginBottom:16}}>😤</Text>
      <ActivityIndicator size="large" color={colors.gold}/>
    </View>
  );

  return (
    <Stack.Navigator screenOptions={{headerShown:false, contentStyle:{backgroundColor:colors.bg}}}>
      {user ? (
        <Stack.Screen name="AppTabs" component={AppTabs}/>
      ) : (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen}/>
          <Stack.Screen name="AuthStack"  component={AuthStack}/>
        </>
      )}
    </Stack.Navigator>
  );
}
