import * as datefns from 'date-fns'
import { SQLServer } from '../../../toolts'
import { helper } from '../../../../../globalTool'
import { IDB51Hourly, IDBGCDATA, IDBStaionDailyReportData, IDBStation, IDBStationDailyReport, IStationDuty } from '../../../../../Interface';


export async function fillDailyReport(
  date: number|Date,
  station: IDBStation, 
  db51_today: IDB51Hourly[], 
  db51_lastd: IDB51Hourly[], 
  gcdata: IDBGCDATA, 
  LineID: number){

  const dateString = datefns.format(date, 'yyyyMMdd');
  const yesterday = new Date(date).getTime() - 3600*24*1000;
  const [,yyyy,MM,dd] = dateString.match(/(\d{4})(\d{2})(\d{2})/)!
  const [,_yyy,_M,_d] = datefns.format(yesterday, 'yyyyMMdd').match(/(\d{4})(\d{2})(\d{2})/)!
  const { StationID } = station
  const totalPres                 = db51_today.reduce((a,b) => a+ b[LineID == 1? "Pevc1":"Pevc2"], 0)
  const totalTemp                 = db51_today.reduce((a,b) => a+ b[LineID == 1? "Tevc1":"Tevc2"], 0)
  
  const AvgPressure               = totalPres / db51_today.length
  const AvgTemp                   = totalTemp / db51_today.length
  // console.log({ AvgTemp, station, LineID, date })

  const db51_today_24             = db51_today.sort(helper.sortLargeToSmall({ by: "Time" }))[0]
  // .reduce((a,b) => a.Time > b.Time ? a : b)
  const db51_lastd_24             = db51_lastd.sort(helper.sortLargeToSmall({ by: "Time" }))[0]
  // .reduce((a,b) => a.Time > b.Time ? a : b)
  // GROSS
  const GrossVolumeAcumulated     = LineID == 1 ? db51_today_24.Vm_line1 : db51_today_24.Vm_line2;
  const GrossVolume               = LineID == 1 ? db51_today_24.Vm_line1 - db51_lastd_24.Vm_line1 
                                                : db51_today_24.Vm_line2 - db51_lastd_24.Vm_line2
  const AvgGrossVolume            = GrossVolume / 24
  // STANDARD
  const StandardVolumeAcumulated  = LineID == 1 ? db51_today_24.Vb_line1 : db51_today_24.Vb_line2;
  const StandardVolume            = LineID == 1 ? db51_today_24.Vb_line1 - db51_lastd_24.Vb_line1
                                                : db51_today_24.Vb_line2 - db51_lastd_24.Vb_line2;
  const AvgStandardVolume         = StandardVolume /db51_today.length
  // ENERGY
  const Energy                    = StandardVolume * gcdata['Heat value'] * 947.817 * Math.pow(10,-6)
  const AvgEnergy                 = Energy / db51_today.length

  const StationDailyReport: IDBStaionDailyReportData = {
    StationID,
    LineID,
    Date: dateString,
    AvgTemp,
    AvgPressure,
    GrossVolumeAcumulated,
    GrossVolume,
    AvgGrossVolume,
    StandardVolumeAcumulated,
    StandardVolume,
    AvgStandardVolume,
    Energy, 
    AvgEnergy
  }

  return {
    reportData: StationDailyReport,
    save: async () => {
      // let sqlCommand = `INSERT INTO ${SQLServer.Tables.ReportStationDaily} ${SQLServer.buildInsert(StationDailyReport)}`
      // const operation = await SQLServer.runQuery(sqlCommand) as IResult<IRecordSet<{"": string}>>
      const newID = await SQLServer.Table("ReportStationDaily").post([StationDailyReport]).then(res => Object.values(res.recordset[0])[0])
      // const newID = +Object.values(operation.recordset[0])[0]
      const dataReturn: IDBStationDailyReport = { ...StationDailyReport, ReportID: newID }
      return dataReturn
    }
  }
}