export interface UserInfo {
  index: string;
  nickname: string;
  win: number;
  defeat: number;
  userId?: string;
  rename?: boolean;
}
export interface UserInfoProps extends UserInfo {
  black?: boolean;
}
