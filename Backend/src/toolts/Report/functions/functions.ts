import { SQLServer } from '../..'
import { IDBStationDailyReport, TSQLFilter } from '../../../../../Interface'

/**
 * @description consume only by backend
 * @param date 'yyyyMM' | 'yyyyMMdd'
 * @returns 
 */
export function get(date: string, StationID?:string) {
  const filter: TSQLFilter<IDBStationDailyReport> = {
    operator: "AND",
    values:[{ Date: date+'%', compare: "like" }] 
  }
  if(StationID) filter.values.push({ StationID: +StationID })
  return SQLServer
    .Table("ReportStationDaily")
    .select({ filter })
    .then( res => res.recordset )
}

/**
 * @description consume only by backend
 * @param date 'yyyyMMdd'
 * @returns 
 */
export function _delete(StationID: number, date: string) {
  // const sqlCommand = `DELETE FROM ${SQLServer.Tables.ReportStationDaily} WHERE StationID='${StationID}' AND Date='${date}'`
  return SQLServer
  .Table("ReportVolumeStationManual")
  .delete({ operator: "AND", values: [{ StationID }, { Date: +date }]})
  // .runQuery(sqlCommand)
}

export function getManual(StationID: number, { from, to }: { from: number, to: number }) {
  // const sqlCommand = `SELECT * FROM ${SQLServer.Tables.ReportVolumeStationManual} WHERE StationID='${StationID}' AND Date >= ${from} AND Date <= ${to}`
  return SQLServer
  .Table("ReportVolumeStationManual")
  .select({ filter: { operator: "AND", values: [{ StationID }, { Date: from, compare: ">=" }, { Date:  to, compare: "<="  }]}})
  .then( res => res.recordset )
  // .runQuery(sqlCommand)
  //   .then(res => res.recordset as IDBVolumeStationManual[])
}

export function delManual(StationID: number,  { from, to }: { from: number, to: number }) {
  // const sqlCommand = `DELETE FROM ${SQLServer.Tables.ReportVolumeStationManual} WHERE StationID='${StationID}' AND Date >= ${from} AND Date <= ${to}`
  return SQLServer
  .Table("ReportVolumeStationManual")
  .delete({ operator: "AND", values: [{ StationID }, { Date: from, compare: ">=" }, { Date: to, compare: "<=" }]})
}
