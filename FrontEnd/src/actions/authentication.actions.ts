import { IViewAuthentication } from '../../../Interface'

export interface IViewLogin {
  type: "LoginRequest",
}

export interface IViewLogOut {
  type: "LogoutRequest",
}

export interface IViewLogInSuccess {
  type: "LoginSuccess",
  payload: IViewAuthentication
}

export function LogInRequest(): IViewLogin {
  return { type: "LoginRequest" }
}

export function LogOutRequest(): IViewLogOut { 
  return { type: "LogoutRequest" }
}

export function LogInSuccess(user: IViewAuthentication): IViewLogInSuccess {
  return {
    type: "LoginSuccess", payload: user
  }
}

export type AuthenticaionActions = IViewLogin | IViewLogOut | IViewLogInSuccess