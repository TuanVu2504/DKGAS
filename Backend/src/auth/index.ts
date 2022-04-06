import jwt, { VerifyErrors } from 'jsonwebtoken'
import { IWebTokenObject } from '../../../Interface'
import { Request, Response, NextFunction } from 'express'
import { settings } from '../app.settings'
import { v4 as uuidv4 } from 'uuid'

const allow_token = [
  "1loveyouvt123", // test api from C# to nodejs
]

export const auth = {
  decodeCookie: <T = IWebTokenObject>(token: string) => {
    if(allow_token.some(tk => tk == token)){
      return {
        Username: 'admin',
        id: "unknown",
        exp: 0,
        iat: 0
      }
    }
    const verify = jwt.verify(token, settings.jwt_key)
    return verify as unknown as T
  },
  /**@param to - number of seconds */
  sign: (username: string, to: number = settings.cookie.duration) => {
    const expired = (new Date().getTime()/1000 + to)
    const tokenObject: Omit<IWebTokenObject, "iat"> = {
      Username: username, 
      id: uuidv4(), 
      exp: expired
    }
    return jwt.sign(tokenObject, settings.jwt_key )
  }
}

export const getTokenFromHeaders = (req: Request) => {
  const cookie = req.cookies[settings.cookie.name]
  if(cookie) return cookie
  return null
}

export const authenMiddleware = {
  required: (req: Request, res: Response, next: NextFunction) => {
    const cookie = getTokenFromHeaders(req)
    if(cookie && allow_token.some(tk => tk == cookie)){
      return next()
    }
    jwt.verify(cookie, settings.jwt_key, async (err: VerifyErrors|null, decoded?: object) => {
      if(err||!decoded){
        return next({ status: 401, message: `Authentication is required`})
      }

      const typed_decode = decoded as IWebTokenObject
      req.userToken = typed_decode
      req.currentUser = typed_decode
      next();
    })
  },
}

