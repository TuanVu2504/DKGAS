import { api } from '../../helpers'
import { IDBUpstreamMonthlyManualReport } from '../../../../Interface'

export class UpStreamServices {
  static get(option: { from: number, to: number }) {
    return api<IDBUpstreamMonthlyManualReport[]>(`/api/reports/upstream?from=${option.from}&to=${option.to}`)
  }
  static update(option: Pick<IDBUpstreamMonthlyManualReport, "Date"|"TotalVolumeManual">){
    return api<IDBUpstreamMonthlyManualReport>(`/api/reports/upstream?Date=${option.Date}` ,{
      headers: { 'Content-Type': 'application/json' },
      method: "POST",
      body: JSON.stringify({ 
        TotalVolumeManual: option.TotalVolumeManual
      })
    })
  }
}