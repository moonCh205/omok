import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { gameSlice, colorSlice } from './slices/omokSlice';
// import todoSlice from './slices/todoSlice';
// import userSlice from './slices/userSlice';

const logger = createLogger();

const rootReducer = combineReducers({
  counter: colorSlice.reducer,
  game: gameSlice.reducer,
  //   user: userSlice.reducer
});

const initialState = {};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState: initialState,
  enhancers: (defaultEnhancers) => [...defaultEnhancers],
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;

/*
*reducer
리덕스 스토어의 rootReducer를 설정.
combineReducers 함수를 사용하여 slice reducer들을 병합한 rootReducer를 설정 가능.
단일 함수로 설정한 경우엔 스토어의 rootReducer로 사용됨.
slice reducer로 설정한 경우엔 자동으로 combineReducers에 전달하여 rootReducer를 생성.

*middleware
redux-logger와 같은 리덕스 미들웨어를 설정.
미들웨어를 설정한 경우엔 자동으로 applyMiddleware에 전달.
미들웨어를 설정하지 않은 경우엔 getDefaultMiddleware를 호출.

*devTools
Redux DevTools 사용 여부 설정. (기본값은 true)
preloadedState
리덕스 스토어의 초기값 설정.

*enhancers
사용자 정의 미들웨어를 설정.
콜백 함수로 설정하면 미들웨어 적용 순서를 정의 가능.
*/
