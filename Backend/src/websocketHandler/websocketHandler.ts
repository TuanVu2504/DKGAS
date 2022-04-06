import Websocket from 'websocket'
import { auth } from '../auth'
import { settings } from '../app.settings'
import { WebSocketStore } from './SocketStore'
import { ClientMessageObject } from '../../../Interface'
const wsStore = WebSocketStore.getSockets()

export const reject = (request: Websocket.request, reason: string) => {
  request.reject(401, reason);
  console.log(reason)
  return
}

export const websocketHandler = (request: Websocket.request) => {
  const cookie = request.cookies.find(u => u.name == settings.cookie.name )
  if(!cookie) return reject(request, "Missing token string")

  const user = auth.decodeCookie(cookie.value)
  if(user.exp*1000 - new Date().getTime() < 0){
    return reject(request, "Session expired")
  }
  const connection = request.accept('echo-protocol', request.origin);
  connection.on("message", message => {
    if(message.type == "utf8"){
      const message_object = JSON.parse(message.utf8Data) as ClientMessageObject
      switch(message_object.type){
        case "Initialize WebSocket Connection":{
          const id = message_object.payload.id
          return wsStore.pushSocket({ user, connection, id })
        }
      }
    }
    console.log(`Client is sending message not as utf8. Im not going to handle it. Ignore`)
  })
}
