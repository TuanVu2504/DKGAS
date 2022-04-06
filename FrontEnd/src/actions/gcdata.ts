import { IGCDataEventAdd, 
  IGCDataUpdated, 
  IDBGCDATAEventParse, IDBGCDATA, IGCDataLiveUpdate,
  IGCDataDownload, IGCDataState
} from '../../../Interface'

export function gcDataDownload(payload: IGCDataState): IGCDataDownload {
  return { type: "GCDataDownload", payload }
}

export function gcDataUpdated(payload: IDBGCDATA): IGCDataUpdated {
  return { type: "GCDataUpdated", payload }
}

export function gcDataEventAdd(payload: IDBGCDATAEventParse): IGCDataEventAdd {
  return { type: "GCDataEventAdd", payload }
}

export function gcDataLiveUpdate(payload: IDBGCDATA): IGCDataLiveUpdate {
  return { type : "GCDataLiveUpdate", payload }
}