import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useDispatch, useSelector} from 'react-redux';
import {ActivityIndicator, View} from 'react-native';
import {restoreSession} from '../redux/authSlice';
import {fetchAll} from '../redux/progressSlice';
import {RootState, AppDispatch} from '../redux';
import {colors} from '../theme/colors';

// Screens
import LoginScreen    from '../screens/LoginScreen';
import SignupScreen   from '../screens/SignupScreen';
import TaskScreen     from '../screens/TaskScreen';
import HistoryScreen  from '../screens/HistoryScreen';
import ProfileScreen  from '../screens/ProfileScreen';

export type RootStackParams = {
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

function AuthStack() {
  return (
    <Auth.Navigator screenOptions={{headerShown:false, contentStyle:{backgroundColor:colors.bg}}}>
      <Auth.Screen name="Login"  component={LoginScreen}/>
      <Auth.Screen name="Signup" component={SignupScreen}/>
    </Auth.Navigator>
  );
}

function AppTabs() {
  const tabIcon: Record<string,string> = { Task:'⚔️', History:'📋', Profile:'👤' };
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg2,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor:   colors.gold,
        tabBarInactiveTintColor: colors.text3,
        tabBarLabel: route.name === 'Task' ? 'Aufgaben' : route.name === 'History' ? 'Verlauf' : 'Profil',
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
    <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:colors.bg}}>
      <ActivityIndicator size="large" color={colors.gold}/>
    </View>
  );

  return (
    <Stack.Navigator screenOptions={{headerShown:false, contentStyle:{backgroundColor:colors.bg}}}>
      {user
        ? <Stack.Screen name="AppTabs" component={AppTabs}/>
        : <Stack.Screen name="AuthStack" component={AuthStack}/>
      }
    </Stack.Navigator>
  );
}
