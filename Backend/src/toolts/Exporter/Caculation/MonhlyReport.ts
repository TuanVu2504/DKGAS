import * as datefns from 'date-fns'
import { IDBStation } from '../../../../../Interface'
import { SQLServer } from '../..'
import { tools } from '../../helper'

export async function CaculateMonthlyReport(station: IDBStation, date: Date|number, LineID: number){
  let result: [string,string,string,string,string,string,string,string][] = []
  const { StationID } = station
  const dailyReports = await SQLServer.Table("ReportStationDaily")
                        .select({ filter: { 
                          "operator": "AND",
                          values: [
                            { LineID },
                            { StationID }, 
                            { Date: datefns.format(date, 'yyyyMM') + "%", compare: "like" }
                          ]
                        }}).then( res => res.recordset )
  const days = tools.getDaysOfMonths(date)
  for(const day of days){
    let day_result: [string,string,string,string,string,string,string,string] = ['','','','','','','','']
    const dailyReport = dailyReports.filter(rp => rp.Date == datefns.format(day, 'yyyyMMdd'))[0]
    if(!dailyReport){
      const today_yyyyMMdd = datefns.format(day, 'yyyyMMdd')
      const lastd_yyyyMMdd = datefns.format(datefns.addDays(day, -1), 'yyyyMMdd')
      const [ thisday_db51, lastday_db51, gcdata ] = await Promise.all([
        SQLServer.Table("DataDay").select({ filter: { operator: "AND", values:[{ StationID }, { Day: today_yyyyMMdd }]}}).then(rec => rec.recordset ),
        SQLServer.Table("DataDay").select({ filter: { operator: "AND", values:[{ StationID }, { Day: lastd_yyyyMMdd }]}}).then(rec => rec.recordset ),
        SQLServer.Table("GCdata").select({ filter: { Day: datefns.startOfDay(day).getTime() }}).then(rec => rec.recordset )
      ])
      const requires: string[] = []
      if(thisday_db51.length == 0){ requires.push("db51_today")}
      if(lastday_db51.length == 0){ requires.push("db51_lastd")}
      if(gcdata.length == 0){ requires.push("gcdata")}
      day_result = day_result.map( r => requires.join(',') + ' ?') as typeof day_result
      day_result[0] = datefns.format(day, 'dd/MM/yyyy')
    } else {
      day_result = [
        datefns.format(day, 'dd/MM/yyyy'),
        dailyReport.AvgTemp.toFixed(4),
        dailyReport.AvgPressure.toFixed(4),
        dailyReport.GrossVolumeAcumulated.toFixed(4),
        dailyReport.GrossVolume.toFixed(4),
        dailyReport.StandardVolumeAcumulated.toFixed(4),
        dailyReport.StandardVolume.toFixed(4),
        dailyReport.Energy.toFixed(4)
      ]
    }
    result.push(day_result)
  }

  return result
}