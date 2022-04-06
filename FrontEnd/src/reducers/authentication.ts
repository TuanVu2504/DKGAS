
import { IViewAuthentication } from '../../../Interface'
import { AuthenticaionActions } from '../actions'

const defaultState:IViewAuthentication = {
  name: 'Buddy',
  authenticated: false,
  loggingIn: false,
}
export function authentication(state = defaultState, actions: AuthenticaionActions): IViewAuthentication {
  switch(actions.type){
    case "LoginRequest": {
      return { ...state, loggingIn: true, authenticated: false }
    }

    case "LoginSuccess": {
      return { ...state, name: actions.payload.name, loggingIn: false, authenticated: true }
    }

    case "LogoutRequest": {
      return { ...state, name: 'Buddy', loggingIn: false, authenticated: false }
    }
    default : return state
  }
}