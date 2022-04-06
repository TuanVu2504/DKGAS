import  { api } from '../../helpers'
import { IDBVolumeStationManual } from '../../../../Interface'
import * as datefns from 'date-fns'

export class StaitonManualServices {
  static update(option: Pick<IDBVolumeStationManual, "StationID"|"TotalVolumeManual"|"Date">){
    return api<IDBVolumeStationManual>(`/api/reports/stationManual/${option.StationID}`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        StationID: option.StationID,
        TotalVolumeManual: option.TotalVolumeManual,
        Date: option.Date
      })
    })
  }
}