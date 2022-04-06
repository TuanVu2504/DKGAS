import {  IWebTokenObject } from '../../../Interface'

declare global {
  interface Error {
    status?: number
  }
  namespace Express {
    export interface Request {
      userToken?: IWebTokenObject, 
      currentUser?: IWebTokenObject
    }
  }
}