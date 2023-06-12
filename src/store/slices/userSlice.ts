import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { userUtil } from 'store/controller/userSliceController';
import type { UserInfo } from '../../type/userType';

const userInitState: UserInfo = userUtil.initState();

export const userSlice = createSlice({
  name: 'userManager',
  initialState: userInitState,
  reducers: {
    updateName: (state, action: PayloadAction<string>) => {
      state.nickname = action.payload;
    },
    updateResult: (state, action: PayloadAction<boolean>) => {
      action ? state.win++ : state.defeat++;
    },
    login: (state, action: PayloadAction<UserInfo>) => {
      console.log('로그인진행');
      // state = action.payload;
      (state.userId = action.payload.userId),
        (state.win = action.payload.win * 1),
        (state.defeat = action.payload.defeat * 1),
        (state.nickname = action.payload.nickname),
        (state.index = action.payload.index),
        console.log('state변함', state);
    },
    rename: (state, action: PayloadAction<boolean>) => {
      // state = action.payload;
      state.rename = action.payload;
    },
  },
});

// 필요 없을 수 있는 코드
export const { updateName, updateResult, login, rename } = userSlice.actions;
