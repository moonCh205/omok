import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { UserInfo } from 'util/type/userType';

interface RoomInfo {
  blackUser?: UserInfo;
  whiteUser?: UserInfo;
  other: UserInfo[];
}
const roomInitState: RoomInfo = { other: [] };

export const roomSlice = createSlice({
  name: 'roomManager',
  initialState: roomInitState,
  reducers: {
    updateBlack: (state, action: PayloadAction<UserInfo>) => {
      state.blackUser = action.payload;
    },
    updateWhite: (state, action: PayloadAction<UserInfo>) => {
      state.whiteUser = action.payload;
    },
    appendOther: (state, action: PayloadAction<UserInfo>) => {
      state.other.push(action.payload);
    },
    resetBlack: (state) => {
      const initialState = { blackUser: undefined };
      const newState = Object.assign(state, initialState);
      state = newState;
    },
    resetWhite: (state) => {
      const initialState = { whiteUser: undefined };
      const newState = Object.assign(state, initialState);
      state = newState;
    },
    updateOther: (state, action: PayloadAction<UserInfo>) => {
      const faind = state.other.indexOf(action.payload);
      if (faind > -1) {
        state.other.splice(faind, 1);
      }
    },
    reset: () => roomInitState,
  },
});

// 필요 없을 수 있는 코드
export const { updateBlack, updateWhite, updateOther, reset, appendOther, resetBlack, resetWhite } = roomSlice.actions;
