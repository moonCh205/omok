import type { UserInfo } from 'type/userType';
export interface Chatting {
  user?: UserInfo;
  sandTime?: Date;
  message: string;
  messageType?: string;
}
