import { IGCDataState, GCDataActions, IDBGCDATA, IDBSwitchGCdata } from '../../../Interface'

const defaultGCData: IDBGCDATA = {
  "Ethane": 0,
  "Heat value": 0,
  "Methan": 0,
  "Propane": 0,
  "carbondioxit": 0,
  "i-Butane": 0,
  "i-Pentane": 0,
  "n-Pentane": 0,
  "n-butane": 0,
  "n-hexane": 0,
  "nitrogen": 0,
  "relative": 0,
  "gcID": 0,
  Day: new Date().getTime()
}

const defaultState : IGCDataState = {
  gcData: [],
  gcDataEvent: [],
  gcDataLive: defaultGCData,
  gcDataLiveMode: {
    "ID": 0,
    "Mode": 0,
    "SwitchAt": 0,
    "SwitchBy": "User"
  },
}

export const gcDataState = (state = defaultState, action: GCDataActions): IGCDataState => {
  switch(action.type){
    case "GCDataDownload": {
      const { payload } = action
      return { ...state, ...payload }
    }

    case "GCDataEventAdd": {
      return {
        ...state,
        gcDataEvent: [...state.gcDataEvent, action.payload]
      }
    }
    
    case "GCDataSwitchLive": {
      return {
        ...state,
        "gcDataLiveMode": action.payload
      }
    }

    case "GCDataUpdated": { 
      const { payload } = action
      return { 
        ...state,
        gcData: state.gcData.every(gc => gc.gcID != payload.gcID) ? [...state.gcData, payload] 
              : state.gcData.map(e => e.gcID == payload.gcID ? ({ ...e,...payload }) : e )
      }
    }

    case "GCDataLiveUpdate": {
      const { payload } = action
      return { ...state, gcDataLive: payload }
    }

    default: return state
  }
}