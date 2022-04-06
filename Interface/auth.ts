export interface IWebTokenObject {
  Username: string,
  id: string,
  exp: number,
  iat: number
}

export interface IDBUser {
  name: string
}

export interface IViewAuthentication extends IDBUser {
  authenticated: boolean
  loggingIn: boolean
}