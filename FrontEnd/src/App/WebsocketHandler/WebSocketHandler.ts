import { w3cwebsocket as W3CWebSocket } from 'websocket'
import React from 'react'
import { useDispatch } from 'react-redux'
import { WSDispatchAction, ServerMessageObject, IClientMessageInitializeConnection } from '../../../../Interface'
import { useSelectorTyped } from '../../reducers'
import { useModal } from '../hook'


const id = new Date().getTime()

const initialize_ws_connection:IClientMessageInitializeConnection = {
  type: "Initialize WebSocket Connection",
  payload: { id: `${id}` }
}

export function useSocket(){
  const { authenticated } = useSelectorTyped( state => state.authentication )
  const dispatch = useDispatch()
  const [wsClient, setWSClient] = React.useState<W3CWebSocket|undefined>();
  const { BlockUserInteraction ,close } = useModal()
  
  React.useEffect(() => {
    let connected = wsClient ? true : false
    if(!authenticated) return
    const connect = () => {
      if(wsClient) return
      let _wsClient = new W3CWebSocket('ws://scada.dkgas.com.vn:80', "echo-protocol")
      _wsClient.onopen = () => {
        _wsClient.send(JSON.stringify(initialize_ws_connection))

        _wsClient.onmessage = message => {
          const message_object = JSON.parse(message.data.toString()) as ServerMessageObject
          if(message_object.type == "Initialize WebSocket Connection"){
            if(message_object.payload.accept){
              connected = true
              BlockUserInteraction("Initialize connection success", "Connected");
              setWSClient(_wsClient)
              setTimeout(close, 1500)
            }
          }
        }
      }

      _wsClient.onerror = err => { 
        console.log(`ws error ${JSON.stringify(err,  ["message", "arguments", "type", "name"])}`) 
        _wsClient.close()
      }
      _wsClient.onclose = ()  => {  
        _wsClient.close()
      }
    }

    const tryReconnect = async () => {
      while(!connected){
        connect()
        await new Promise(res => setTimeout(res, 5000))
      }
      console.log(`ws connected`)
    }

    tryReconnect()

  }, [authenticated, wsClient])

  React.useEffect(() => {
    if(!wsClient) return
    wsClient.onclose = () => { 
      BlockUserInteraction("Lost connection. Restoring...") 
      setWSClient(undefined)
    }
    wsClient.onmessage = message => {
      const WSMessage: WSDispatchAction = JSON.parse(message.data.toString())
      dispatch(WSMessage)
    }
    wsClient.onerror = (err) => { 
      console.log(`ws error ${JSON.stringify(err,  ["message", "arguments", "type", "name"])}`) 
    }
  }, [wsClient])
}