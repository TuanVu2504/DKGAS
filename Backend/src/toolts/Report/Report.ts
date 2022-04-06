import { get, _delete, getManual,delManual,fillDailyReport } from './functions'
import * as datefns from 'date-fns'
import { SQLServer } from '../mssqlConnection'
import { DKError } from '../Error'
import { Exporter } from '../Exporter'
import { stationConfig } from '../../../../globalSettings'
import { IDBGCDATA, IDBStation, IDBStationDailyReport } from '../../../../Interface'

export class StationDailyReportStore {
  static get = get
  static delete = _delete
  static Manual = {
    getManual, 
    delManual
  }
  static fillDailyReport = fillDailyReport
  /**
   * @param option
   * @param option.date - can be any time of a day
   */
  static async requestUpdated(option: { type: "gcdata", date: number }|{ type: "station", date: number, station: IDBStation }){
    const __date = datefns.startOfDay(option.date)
    switch(option.type){
      case "gcdata": {
        const stations = stationConfig.stations
        const db_gcdata = await SQLServer.Table("GCdata").select({ filter: { "Day": __date.getTime() }}).then(rec => rec.recordset )
        if(db_gcdata.length == 0) throw new Error(DKError.GCData.not_found(__date.getTime()))
        const gcdata = db_gcdata[0]
        return Promise.all(stations.map( async station => StationDailyReportUpdate(station, gcdata, __date)
        )).then( res => res.filter(r => r!== undefined).flat(1) as IDBStationDailyReport[])
      }
      case "station": {
        const station = option.station
        const db_gcdata = await SQLServer.Table("GCdata").select({ filter: { "Day": __date.getTime() }}).then(rec => rec.recordset )
        if(db_gcdata.length == 0) return []
        const gcdata = db_gcdata[0]
        return StationDailyReportUpdate(station, gcdata, __date).then( res => res?.filter( r => r!==undefined) as IDBStationDailyReport[] )
      }
    }
  }
}

async function StationDailyReportUpdate(station: IDBStation, gcdata: IDBGCDATA, date: Date){
  const __date = datefns.startOfDay(date)
  const _lastd = datefns.addDays(__date, -1)
  const [yyyy,MM,dd] = datefns.format(__date, 'yyyy-MM-dd').split('-')
  const [_yyy,_M,_d] = datefns.format(_lastd, 'yyyy-MM-dd').split('-')
  const duty = await SQLServer.Table("Duty")
                              .select({ top:1, order: { by:"DutyID", dir: "DESC"}, filter: { operator: "AND", values: [{ StationID: station.StationID }, { SwitchAt: datefns.endOfDay(date).getTime(), compare: "<=" }]}})
                              .then( rec => rec.recordset[0])
  const db51_today = await SQLServer.Table("DataDay").select({ filter: { operator: "AND", values: [{ StationID: station.StationID }, { Day: datefns.format(__date, 'yyyyMMdd') }] } }).then( res => res.recordset )
  const db51_lastd = await SQLServer.Table("DataDay").select({ filter: { operator: "AND", values: [{ StationID: station.StationID }, { Day: datefns.format(_lastd, 'yyyyMMdd') }] } }).then( res => res.recordset )
  if(db51_today.length == 0 || db51_lastd.length == 0 || !duty ) return

  let response: IDBStationDailyReport[] = []
  const stationDailyReports = await SQLServer.Table("ReportStationDaily").select({ 
    "filter": { 
      "operator": "AND",
      values: [{ "Date": datefns.format(__date, 'yyyyMMdd') },{ StationID: station.StationID }]
    }
  }).then( res => res.recordset )

  if(station.type == "EVC" && stationDailyReports.length > 1 ){
    throw new Error(`There are more than 1 daily report for station type = EVC, stationID: ${station.name} on day: ${datefns.format(__date, 'yyyyMMdd')}`)
  }
  const line1dailyreport = await StationDailyReportStore.fillDailyReport(__date, station, db51_today, db51_lastd, gcdata,1 )
  const savedline1dailyreport = stationDailyReports.find(l => l.LineID == 1)
  if(!savedline1dailyreport){
    const newlyID =  await SQLServer.Table("ReportStationDaily").post([line1dailyreport.reportData]).then( res => Object.values(res.recordset[0])[0] )
    response.push({ ...line1dailyreport.reportData, ReportID: newlyID })
  } else {
    await SQLServer.Table("ReportStationDaily").update({ where: { "ReportID": savedline1dailyreport.ReportID }, update: line1dailyreport.reportData })
    response.push({ ...line1dailyreport.reportData, ReportID: savedline1dailyreport.ReportID })
  }

  if(station.type == "FC"){
    const line2dailyreport = await StationDailyReportStore.fillDailyReport(__date, station, db51_today, db51_lastd, gcdata, 2)
    const savedline2dailyreport = stationDailyReports.find(l => l.LineID == 2)
    if(!savedline2dailyreport){
      const newlyID = await SQLServer.Table("ReportStationDaily").post([line2dailyreport.reportData]).then(res => Object.values(res.recordset[0])[0])
      response.push({ ...line2dailyreport.reportData, ReportID: newlyID })
    } else {
      await SQLServer.Table("ReportStationDaily").update({ where: { ReportID: savedline2dailyreport.ReportID }, update: line2dailyreport.reportData })
      response.push({ ...line2dailyreport.reportData, ReportID: savedline2dailyreport.ReportID })
    }
  }

  await Exporter.DailyReport(station, new Date(date)).excel()
  await Exporter.DailyReport(station, new Date(date)).pdf()

  return response
}