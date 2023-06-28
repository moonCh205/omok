import type { UserInfo } from 'util/type/userType';
export interface Chatting {
  user?: UserInfo;
  sandTime?: Date;
  message: string;
  messageType?: string;
}
