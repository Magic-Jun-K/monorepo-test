import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '@/services';

// 登录
// createAsyncThunk 创建一个异步操作的 thunk
export const login = createAsyncThunk(
  'auth/login',
  // credentials 登录凭证
  // rejectWithValue 错误处理
  async (credentials: Auth.Credentials, { rejectWithValue }) => {
    try {
      const response = await api.login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 
        typeof error === 'object' && error !== null ? 
          (error as { response?: { data?: unknown } })?.response?.data : 
        'Unknown error'
      );
    }
  }
);

// 初始状态
const initialState: Auth.State = {
  user: null,
  token: null,
  status: 'idle',
  error: null
};

// 创建切片
const authSlice = createSlice({
  // 名称
  name: 'auth',
  // 初始状态
  initialState,
  // 同步状态
  reducers: {
    // 登出
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  // 异步状态
  extraReducers: (builder) => {
    // 登录
    builder
      // 登录中
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      // 登录成功
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.access_token;
      })
      // 登录失败
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        // state.error = action.payload?.message || '登录失败';
        state.error = (
          typeof action.payload === 'object' && 
          action.payload !== null &&
          'message' in action.payload
        ) ? (action.payload as { message: string }).message : '登录失败';
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;