import { MAP_SIZE } from 'util/const';
import { customLog } from 'util/util';
import type { UserInfo } from '../../type/userType';
export const userUtil = {
  initState: function (): UserInfo {
    return {
      index: '0',
      win: 0,
      defeat: 0,
      // introduction: '인생은 어디서와서 어디로 가는걸까.',
      nickname: 'noname',
      // classCode: 1,
      // isLogin: true,
    };
  },
};
