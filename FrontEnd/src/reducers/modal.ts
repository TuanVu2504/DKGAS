import { IModalState } from '../../../Interface'
import { ModalActions } from '../actions'

const defaultState: IModalState = {
  type: "UserInteraction",
  confirmedState: {
    ok: false,
    actionID: ''
  },
  open: false,
  title: "Confirm",
  message: {
    type: "string",
    content: "Are you sure?"
  },
  buttons: [
    { type: "cancel", text: "Cancel" },
  ]
}

export function modal(state = defaultState, actions: ModalActions): IModalState{
  switch(actions.type){
    case "CloseModal": { return defaultState }
    case "OpenModal": {
      return { 
        ...state, ...actions.payload, open: true,
      }
    }
    case "Confirmed": {
      return {
        ...state, 
        confirmedState: {
          ok: true,
          actionID: actions.actionID
        },
      }
    }
    default: return state
  }
}