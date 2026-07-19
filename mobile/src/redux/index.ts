import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer   from './authSlice';
import progressReducer from './progressSlice';

const rootReducer = combineReducers({
  auth:     authReducer,
  progress: progressReducer,
});

const persistConfig = {
  key:     'dsl-root',
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefault =>
    getDefault({
      serializableCheck: { ignoredActions: [FLUSH,REHYDRATE,PAUSE,PERSIST,PURGE,REGISTER] },
    }),
});

export const persistor = persistStore(store);
export type RootState  = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
