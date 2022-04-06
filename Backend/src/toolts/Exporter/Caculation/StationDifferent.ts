import { IDBStation } from '../../../../../Interface'
import { SQLServer, tools } from '../../../toolts'
import { helper } from '../../../../../globalTool'
import * as datefns from 'date-fns'

export async function stationDifferentCaculation(station: IDBStation, date: number|Date){
  const result: [string,string,string,string,string][] = []
  const { StationID } = station
  const startOfMonth = datefns.startOfMonth(date)
  const endOfMonth = datefns.endOfMonth(date)
  const [ dutyEvents, dailyReports, dailyManuals ] = await Promise.all([
    SQLServer.Table("Duty").select({ filter: { StationID }}).then( res => res.recordset ),
    SQLServer.Table("ReportStationDaily").select({ filter: { operator: "AND", values: [{ StationID }, { Date: datefns.format(date, 'yyyyMM')+'%', compare: 'like' }]}}).then( res => res.recordset),
    SQLServer.Table("ReportVolumeStationManual").select({ filter: { operator:"AND", values: [{ StationID }, { Date: startOfMonth.getTime(), compare: ">=" }, { Date: endOfMonth.getTime(), compare: "<=" }] }}).then( rec => rec.recordset )
  ])
  const days = tools.getDaysOfMonths(date) 
  for(const day of days){
    const __date =  datefns.format(day, 'dd/MM/yyyy')
    const auto = dailyReports.filter(rp => rp.Date == datefns.format(day, 'yyyyMMdd'))
    const manu = dailyManuals.find(rp => rp.Date == datefns.startOfDay(day).getTime())
    const duty = dutyEvents.sort(helper.sortLargeToSmall({ by: "DutyID" })).filter(e => +e.SwitchAt <= datefns.endOfDay(day).getTime())[0]
    let totalAuto = '', totalManu = '', deltaVolu = '', deltaPerc = ''
    if(!duty){
      totalAuto = totalManu = deltaVolu = deltaPerc = 'out Duty'
    } else {
      const AutoLineActive  = auto && auto.find( e => e.LineID == duty.LineID)
      totalAuto = AutoLineActive ? AutoLineActive.StandardVolume.toFixed(4) : "???"
      totalManu = manu ? manu.TotalVolumeManual.toFixed(4) : "???"
      if(totalManu != "???" && totalAuto != "???" && (+totalAuto != 0 || +totalManu != 0)){
        deltaVolu = Math.abs(+totalAuto - +totalManu).toFixed(4) 
        deltaPerc = (Math.abs(+totalAuto - +totalManu)*100 /(+totalAuto != 0 ? +totalAuto : +totalManu)).toFixed(4)
      } else {
        if(totalAuto == "???" && totalManu == "???"){
          deltaVolu = "Auto = ???, Manual = ???"
          deltaPerc = "Auto = ???, Manual = ???"
        } else {
          deltaVolu = totalAuto == "???" ? "Auto = ???" : "Manual = ???"
          deltaPerc = totalAuto == "???" ? "Auto = ???" : "Manual = ???"
        }
      }
      // deltaVolu = totalManu != "???" && totalAuto != "???" ? 
      //               Math.abs(+totalAuto - +totalManu).toFixed(4) :
      //               totalManu == "???" ? `Manual = ???` : "Auto = ???"
      // deltaPerc = totalManu != "???" && totalAuto != "???" && +totalAuto != 0 ?
      //               (Math.abs(+totalAuto - +totalManu)*100 / +totalAuto).toFixed(4)
      //               : +totalAuto == 0 ? "recheck auto" :
      //               totalManu == "???" ? `Manual = ???` : "Auto = ???"
      result.push([__date, totalAuto, totalManu, deltaVolu, deltaPerc])
    }
  }

  return result
}