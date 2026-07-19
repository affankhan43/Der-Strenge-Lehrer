import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authAPI} from '../api/api';

interface User {
  _id: string;
  email: string;
  displayName?: string;
  xp: number;
  level: number;
  badges: string[];
  audioEnabled: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = { user: null, loading: false, error: null };

export const login = createAsyncThunk('auth/login', async ({email, password}: {email:string;password:string}, {rejectWithValue}) => {
  try {
    const r = await authAPI.login(email, password);
    await AsyncStorage.setItem('dsl_access_token',  r.data.accessToken);
    await AsyncStorage.setItem('dsl_refresh_token', r.data.refreshToken);
    await AsyncStorage.setItem('dsl_user', JSON.stringify(r.data.user));
    return r.data.user as User;
  } catch (e: any) { return rejectWithValue(e.response?.data?.error || 'Login fehlgeschlagen'); }
});

export const signup = createAsyncThunk('auth/signup', async (data: any, {rejectWithValue}) => {
  try {
    const r = await authAPI.signup(data);
    await AsyncStorage.setItem('dsl_access_token',  r.data.accessToken);
    await AsyncStorage.setItem('dsl_refresh_token', r.data.refreshToken);
    await AsyncStorage.setItem('dsl_user', JSON.stringify(r.data.user));
    return r.data.user as User;
  } catch (e: any) { return rejectWithValue(e.response?.data?.error || 'Signup fehlgeschlagen'); }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  const rt = await AsyncStorage.getItem('dsl_refresh_token') || '';
  try { await authAPI.logout(rt); } catch {}
  await AsyncStorage.multiRemove(['dsl_access_token','dsl_refresh_token','dsl_user']);
});

export const restoreSession = createAsyncThunk('auth/restore', async (_, {rejectWithValue}) => {
  try {
    const stored = await AsyncStorage.getItem('dsl_user');
    if (!stored) return rejectWithValue('no session');
    const r = await authAPI.me();
    await AsyncStorage.setItem('dsl_user', JSON.stringify(r.data.user));
    return r.data.user as User;
  } catch { return rejectWithValue('session expired'); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => { state.error = null; },
    updateUser:  (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) state.user = {...state.user, ...action.payload};
    },
  },
  extraReducers: builder => {
    const pending  = (state: AuthState) => { state.loading=true; state.error=null; };
    const rejected = (state: AuthState, action: any) => { state.loading=false; state.error=action.payload; };

    builder
      .addCase(login.pending,          pending)
      .addCase(login.fulfilled,        (s,a) => { s.loading=false; s.user=a.payload; })
      .addCase(login.rejected,         rejected)
      .addCase(signup.pending,         pending)
      .addCase(signup.fulfilled,       (s,a) => { s.loading=false; s.user=a.payload; })
      .addCase(signup.rejected,        rejected)
      .addCase(logout.fulfilled,       s => { s.user=null; })
      .addCase(restoreSession.fulfilled,(s,a) => { s.user=a.payload; })
      .addCase(restoreSession.rejected, s => { s.user=null; });
  },
});

export const {clearError, updateUser} = authSlice.actions;
export default authSlice.reducer;
