import React from 'react'
import { useDispatch } from 'react-redux'
import { closeModal, confirmActionID } from '../actions'
import { useSelectorTyped } from '../reducers'
import { MSLoader } from './Elements'

const _MyModal = () => {
  const dispatch = useDispatch()
  const modalState = useSelectorTyped(state => state.modal)
  const {
    confirmedState: actionConfirmed,
    type,
    open, 
    title,
    buttons,
    message = { type: "string", content: "Are you sure?" }
  } = modalState
  const modalDefaultClass = 'modal-2'
  const modalClass = `${open?'show': ''} ${modalDefaultClass}`
  
  
  return <div className={modalClass}>
    <div className="flex flex-dir-row space-between title">
      <h1>
        <span className="mg_rig20p">{title}</span>
        {
          type == "NonUserInteraction" ? <MSLoader size="sm"/> : undefined
        }
      </h1>
      { type == "NonUserInteraction" 
        ? undefined 
        : <div className="flex center">
          <span 
            onClick={() => dispatch(closeModal()) } 
            className={`pointer fa fa-times rot45 bg-blue-normal close ${actionConfirmed.ok ? 'disabled': ''}`} />
        </div> }
    </div>
    <div className="message">
    { 
      message.type == "string" ? message.content : 
      message.type == "stringarray" ? message.content.map((message,i) => {
        return <div key={i} className="row">{message}</div>
      }) 
      : `Please instruct me how to render this ${message.type}`
    }
    { type == "UserInteraction" ? <div className="modal-footer flex flex-dir-row rowend">
      {
        buttons.map((button,i) => {
          let buttonStyle = `button ${button.type}`
          buttonStyle += actionConfirmed.ok ? ' disabled' : ''
          const onClick = button.type == "cancel"   ? () => dispatch(closeModal())
                        : button.type == "confirm"  ? () => dispatch(confirmActionID(button.actionid))
                        : () => { alert("I have no handler. Please instruct me what should to do")}

          return <div key={i} onClick={onClick} className={buttonStyle}>{button.text}</div>
        })
      }
      </div>
      : type == 'NonUserInteraction' ?
        <div className="flex center"></div>
      : undefined
    }
    </div>
  </div> 
}

export const MyModal = React.memo( _MyModal )