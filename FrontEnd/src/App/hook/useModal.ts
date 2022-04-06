import React from 'react'
import { useDispatch } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'

import { openModal, closeModal } from '../../actions'
import { useSelectorTyped } from '../../reducers'

interface ICallBack {
  action:(() => Promise<any>),
  actionID: string
}

export function useModal(){
  const { confirmedState, open } = useSelectorTyped(state => state.modal)
  const [ callback, setCallback] = React.useState<ICallBack|undefined>(undefined)
  const dispatch = useDispatch()
  
  React.useEffect(() => {
    if( !confirmedState.ok || confirmedState.actionID == '' 
    || !callback || callback.actionID != confirmedState.actionID ) return
    
    callback.action()
    .then(() => {
      dispatch(closeModal())
    })
  }, [confirmedState,callback])

  React.useEffect(() => {
    if(!open) setCallback(undefined)
  }, [open])

  const close = () => dispatch(closeModal())

  function apiError(err: any){
    dispatch(openModal({ 
      "type": "UserInteraction",
      "title": "API Error",
      "message": {
        type: "string",
        content: err.message
      },
      "buttons": [{
        "text": "Close",
        type: "cancel"
      }],
    }))
  }

  function BlockUserInteraction(reason: string, title = "Please wait"){
    dispatch(openModal({ 
      "type": "NonUserInteraction",
      title,
      "message": { type: "string", content: reason },
      "buttons": [],
    }))
  }

  function warn(content: string|string[]){
    let message: { type: "string", content: string } | { type: "stringarray", content: string[]};
    if(typeof content == "string"){
      message = { type: "string", content }
    }
    else {
      message = { type: "stringarray", content }
    }
    dispatch(openModal({ 
      "type": "UserInteraction",
      "title": "Warning",
      "message": message,
      "buttons": [{
        "text": "Close",
        type: "cancel"
      }],
    }))
    
  }

  function confirm(content: string[], callback: () => Promise<any>){
    const actionID = uuidv4()
    setCallback({ action: callback, actionID })
    dispatch(openModal({
      "type": "UserInteraction",
      title: "Confirmation is required",
      "message": { 
        type:"stringarray", 
        "content": content 
      },
      "buttons":[
        { type: "cancel", text: "No" },
        { type:"confirm", "actionid": actionID, "text": "Confirmed" },
      ]
    }))
  }
  
  return {
    warn,
    confirm,
    apiError,
    BlockUserInteraction,
    close
  }

}