import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WsUtil } from 'store/controller/wsSliceController';

const wsInitState = {
  chat: { ws: new WsUtil('') },
  game: { ws: new WsUtil('') },
};
interface PayloadData {
  type: 'chat' | 'game';
  url: string;
}
export const socketSlice = createSlice({
  name: 'soketManager',
  initialState: wsInitState,
  reducers: {
    connect: (state, action: PayloadAction<PayloadData>) => {
      const type = action.payload.type;
      state[type].ws.url = action.payload.url;
      console.log(state[type]);
      state[type].ws.connect();
    },
  },
});

// 필요 없을 수 있는 코드
export const { connect } = socketSlice.actions;
