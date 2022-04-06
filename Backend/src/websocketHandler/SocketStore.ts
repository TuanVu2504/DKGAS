import { IDKGasSocketConnection } from './interface'
import { IWebTokenObject, WSDispatchAction, IServerMessageInitializeResponse } from '../../../Interface'
import Websocket from 'websocket'
import * as datefns from 'date-fns'


interface INewSocketRequest {
  user: IWebTokenObject,
  connection: Websocket.connection,
  id: string
}
export class WebSocketStore {

  private static instance: WebSocketStore
  private static store: IDKGasSocketConnection[]

  private constructor(){
    WebSocketStore.store = []
  }

  public static getSockets(){
    if(!WebSocketStore.instance){
      WebSocketStore.instance = new WebSocketStore()
    }
    return WebSocketStore.instance
  }

  public pushSocket(newSocketRequest: INewSocketRequest){
    const { user, connection, id } = newSocketRequest
    if(WebSocketStore.store.every(s => s.user.id != id)){
      connection.on("close", (number,desc) => this.removeSocket({ user, connection, id }))
      const accept_response: IServerMessageInitializeResponse = {
        type: "Initialize WebSocket Connection",
        payload: {
          accept: true
        }
      }
      connection.send(JSON.stringify(accept_response))
      console.log(`${datefns.format(new Date(), 'yyyy-MM-dd HH:mm:ss')} adding ${user.Username} ${id} to socket stores`)
      WebSocketStore.store.push({ connection, user, id })
    }
  }

  public removeSocket(socket: IDKGasSocketConnection){
    if(WebSocketStore.store.find(_socket => _socket.id == socket.id )){
      WebSocketStore.store = WebSocketStore.store.filter( _socket => _socket.id != socket.id )
      console.log(`${datefns.format(new Date(), 'yyyy-MM-dd HH:mm:ss')} removed ${socket.id} from store`)
    }
  }

  public broadcast(ob: WSDispatchAction){
    if(WebSocketStore.store.length > 0){
      WebSocketStore.store.map( s => s.connection.send(JSON.stringify(ob)))
    }
  }
}