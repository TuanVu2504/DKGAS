import { IWebTokenObject } from '../../../Interface'
import Websocket from 'websocket'

export interface IDKGasSocketConnection {
  user: IWebTokenObject,
  connection: Websocket.connection,
  id: string
}