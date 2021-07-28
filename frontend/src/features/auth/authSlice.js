import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// signup axios -> REST API, params 필요
export const signup = createAsyncThunk('SIGNUP', async (userInfo) => {
  await axios
    .post('/signup', userInfo)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
});

// email confirm axios -> REST API, params 필요
export const checkEmail = createAsyncThunk('CHECK_EMAIL', async (emailInfo) => {
  await axios
    .get('/checkemail', emailInfo)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err;
    });
});

// nickname confirm axios -> REST API, params 필요
export const checkNickname = createAsyncThunk(
  'CHECK_NICKNAME',
  async (nickname) => {
    await axios
      .get('/checknickname', nickname)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err;
      });
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: {
      nickname: '김싸피',
      email: 'abc@naver.com',
    },
  },
  reducers: {},
  // 조사 필요, return 값 찾아야함
  // fullfilled -> 완료되었을 때 무슨 일을 할지? (signup은 로그인 시켜준다, 이런것?)
  extraReducers: {
    [signup.fulfilled]: (state) => [...state],
    [checkEmail.fulfilled]: () => [],
    [checkNickname.fullfilled]: () => [],
  },
});

// export const { signup } = signUpSlice.actions;
// export const userSelector = (state) => state.user;
export default authSlice.reducer;
