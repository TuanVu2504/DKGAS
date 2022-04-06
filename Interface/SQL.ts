export interface IDB51Hourly {
  /**yyyyMMdd */
  Day: string
  StationID: number
  /**0-24 */
  Time: number 
  Pevc1:number
  Tevc1:number
  Vb_line1:number
  Vm_line1:number
  Energy_line1:number
  Pevc2:number
  Tevc2:number
  Vb_line2:number
  Vm_line2:number
  Energy_line2:number
}

export interface IStationRealTimeDataType { 
  ID:         number, 
  /**@description 1: open | 0: close */
  SDV:        number
  /**@description 1: alarm | 0: normal */
  Horn:       number,
  /**@description 1: alarm | 0: normal */
  Becorn:      number
  GD1:        number
  GD2:        number
  Pout:       number
  Vb:         number//108
  Vm:         number//106
  SVF:        number//122
  GVF:        number//120
  Pevc:       number//124
  Tevc:       number//126
  VbToday:    number//112
  VmToday:    number//114
  VbLast:     number//116
  VmLast:     number //118
  Qmmax:      number //130
  Qmmin:      number //132
  Qbmax:      number//134
  Qbmin:      number//136
  Battery:    number //138
  Battery_02: number //138
  UPS:        number
  Vb_02:      number//108
  Vm_02:      number//106
  SVF_02:     number //122
  GVF_02:     number //120
  Pevc_02:    number//124
  Tevc_02:    number//126
  VbToday_02: number //112
  VmToday_02: number//114
  VbLast_02:  number//116
  VmLast_02:  number //118
  Qmmax_02:   number //130
  Qmmin_02:   number //132
  Qbmax_02:   number//134
  Qbmin_02:   number//136
  /**@description bigint */
  Time:      string|number
  rtIndex:    number
}

export interface IStationConnectionHistory {
  hIndex:   number,
  Time:     number,
  ID:       number,
  Status:   number,
}

export interface IDBSwitchGCdata {
  ID: number,
  Mode: 1|0,
  SwitchAt: number,
  SwitchBy: string,
}

export interface IDBStationDailyReport extends IDBStaionDailyReportData {
  ReportID: number,
}

export interface IDBStaionDailyReportData {
  /**@description yyyyMMdd */
  Date: string,
  StationID: number,
  LineID: number,
  AvgTemp: number,
  AvgPressure: number,
  GrossVolumeAcumulated:number,
  GrossVolume:number,
  AvgGrossVolume:number,
  StandardVolumeAcumulated:number,
  StandardVolume:number,
  AvgStandardVolume:number,
  Energy:number,
  AvgEnergy:number
}

export interface IStationDuty {
  DutyID: number,
  StationID: number,
  /**@description 1 | 2 */
  LineID: number,
  SwitchAt: number,
  SwitchBy: string,
}

export interface IDBGCDATA {
  Methan: number,
  Ethane: number,
  Propane: number
  "i-Butane": number,
  "n-butane": number,
  "i-Pentane": number,
  "n-Pentane": number,
  "n-hexane": number,
  nitrogen: number,
  carbondioxit: number,
  "Heat value": number,
  relative: number,
  /**@description Start of a day */
  Day: number,
  gcID: number,
}

export interface IDBGCDATAEventBase {
  eventID: number,
  userID: string,
  gcDay: number,
  whenChanged: number,
  payload: string | Partial<IDBGCDATA>
}

export interface IDBGCDATAEvent extends IDBGCDATAEventBase {
  payload: string
}
export interface IDBGCDATAEventParse extends IDBGCDATAEventBase {
  payload: Partial<IDBGCDATA>,
}

export interface IDBLogin {
  name: string,
  Pass: string,
  displayName?: string
}

export interface IDBVolumeStationManual {
  ID: number
  StationID: number,
  TotalVolumeManual: number,
  /**@description bigint - datefns.startOfday(day) */
  Date: number
}

export interface IDBUpstreamMonthlyManualReport {
  ID: number,
  TotalVolumeManual: number,
  /**@description bigint - datefns.startOfDay */
  Date: number
}


export type DKDBTables = "realtimeEVC" | "ConnectionHistory" | "Duty" | "Login" | "GCdata" | "GCDataEvent" 
                      | "SwitchGCdata" | "DataDay" | "ReportStationDaily" 
                      | "ReportVolumeStationManual" | "ReportUpstreamMonthlyManual"
export type ReturnTableType<T extends DKDBTables> = 
  T extends "realtimeEVC" ? IStationRealTimeDataType :
  T extends "ConnectionHistory" ? IStationConnectionHistory : 
  T extends "Duty" ? IStationDuty :
  T extends "GCdata" ? IDBGCDATA :
  T extends "GCDataEvent" ? IDBGCDATAEvent :
  T extends "SwitchGCdata" ? IDBSwitchGCdata : 
  T extends "DataDay" ? IDB51Hourly :
  T extends "ReportStationDaily" ? IDBStationDailyReport :
  T extends "ReportVolumeStationManual" ? IDBVolumeStationManual : 
  T extends "ReportUpstreamMonthlyManual" ? IDBUpstreamMonthlyManualReport :
  T extends "Login" ? IDBLogin : never

export type TMysqlCompareOperators = "=" | ">=" | "<=" | "<" | ">" | "like"
// export type QueryFilter<TBT> = {
//   input: { [K in keyof TBT]?: TBT[K] | { value: number|string, operator?: TMysqlCompareOperators }}[],
//   operator: 'AND' | 'OR'
// }
// export interface ISQLQuery<TBT> {
//   top?:number,
//   filter?: Partial<TBT> | QueryFilter<TBT>,
//   order?: { by: keyof TBT, dir: "DESC" | "ASC" }
// }

// new
type FixTsUnion<T, K extends keyof T> = {[Prop in keyof T]?: Prop extends K ? T[Prop]: never}
export type oneOf<T> = { [K in keyof T]: Pick<T, K> & FixTsUnion<T, K>}[keyof T];
export type TSQLFilter<TBT, U = oneOf<TBT>> = oneOf<TBT> & { compare?: TMysqlCompareOperators } | { operator: "AND" | "OR", values: Array<U & { compare?: TMysqlCompareOperators }> }

export interface ISQLQuery2<TBT> {
  top?: number,
  order?: { by: keyof TBT, dir?: "DESC" | "ASC" }
  filter?: TSQLFilter<TBT>,
  props?: (keyof TBT)[]
}

export function buildFilter2<TBT>(input: TSQLFilter<TBT>): string {
  let filterString = ''
  if("operator" in input){
    const { values, operator } = input
    filterString = values.filter(val => {
      return Object.entries(val).some(([k,v]) => {
        if(k === "compare") return true
        const __val = v as undefined | number | null | string
        if(__val !== undefined && __val !== null && __val !== '') return true
        return false
      })
    })
    .map(_val => {
      const { compare, ...rest } = _val
      const __compare = compare || "="
      const pro = Object.keys(rest)[0]
      const val = Object.values(rest)[0]
      return `"${pro}" ${__compare} '${val}'`
    }).join(` ${operator} `)
  } else {
    const { compare, ...rest } = input
    const __compare = compare || "=" 
    const pro = Object.keys(rest)[0]
    const val = Object.values(rest)[0]
    filterString = `"${pro}" ${__compare} '${val}'`
  }

  return filterString
}