import { Request } from 'express';

type AuthPayload = {
  sub: number;
  roleId: number;
  email: string;
};

export interface AuthRequest extends Request {
  user: AuthPayload;
}
