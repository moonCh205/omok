import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CommonState {
  value: boolean
}

const initialState: CommonState = {
  value: false
};

export const colorSlice = createSlice({
  name: 'color',
  initialState,
  reducers: {
    colorWhite(state, action: PayloadAction<boolean>) {
      state.value = true;
    },
    colorBlack: (state, action) => {
      state.value =  false;
    },
  }
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userWhite(state, action: PayloadAction<boolean>) {
      state.value = true;
    },
    userBlack: (state, action) => {
      state.value =  false;
    },
  }
});


export const { colorWhite,colorBlack } = colorSlice.actions;

// 필요 없을 수 있는 코드
export const { userWhite,userBlack } = userSlice.actions;
export default colorSlice;