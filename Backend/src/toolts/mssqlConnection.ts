import mssql, { IResult } from 'mssql'
import * as datefns from 'date-fns'
import { dkgasServer } from '../../../globalSettings'
import { IStationRealTimeDataType, DKDBTables, ReturnTableType,
  IStationDuty, buildFilter2,ISQLQuery2, TSQLFilter
} from '../../../Interface'

type TDelete = { 
  recordsets: [], 
  recordset: undefined, 
  output: {}, 
  /**@description 
   * [number] - represent number of rows affected
   */
  rowsAffected: number[] 
}

const pool = new mssql.ConnectionPool({
  ...dkgasServer.sql,
  options: { 
    enableArithAbort: true,
    trustServerCertificate: true,
    encrypt: false
  },
  stream: true,
})

pool.on('error', err => { 
  console.log(err)
})

export function buildUpdate<T extends DKDBTables>(input: Partial<ReturnTableType<T>>){
  return Object.entries(input)
    .filter(([k,v]) => v !== undefined && v !== null && v !== '')
    .map(([k,v]) => '"' + k + '" =' + "'" + v + "'").join(',')
}

const __Tables = {
  "realtimeEVC": 'realtimeEVC',
  "ConnectionHistory": 'ConnectionHistory',
  "Duty": "Duty",
  "Login": "Login",
  "GCdata": "GCdata",
  "GCDataEvent": "GCDataEvent",
  "SwitchGCdata": "SwitchGCdata",
  "DataDay": "DataDay",
  "ReportStationDaily": "ReportStationDaily",
  "ReportVolumeStationManual": "ReportVolumeStationManual",
  "ReportUpstreamMonthlyManual": "ReportUpstreamMonthlyManual"
}
export const SQLServer = {
  runQuery : (query: string): Promise<any> => {
    // console.log(query)
    return pool.connect()
    .then(connection => connection.query(query))
    .catch(err => {
      console.log(`Error while excute commnad: ${query}`)
      throw err
    })
  },
  postStationRealTimeLatest: async (payload: Omit<IStationRealTimeDataType, "rtIndex">) => {
    const Time = new Date().getTime()
    const insertObject = { ...payload, Time }
    const insertedID = await SQLServer.Table("realtimeEVC").post([insertObject])
                                .then( res => Object.values(res.recordset[0])[0] )
    return { ...insertObject, rtIndex: insertedID } as IStationRealTimeDataType
  },

  getConnectionStatus: (StationID: number) => {
    return SQLServer
    .Table("ConnectionHistory")
    .select({
      order: { by: "hIndex", dir: "DESC" },
      top: 1,
      filter: { ID: StationID }
    })
    .then( res  => res.recordset )
  },

  getDutyStatus: (StationID: number, date: number|Date) => {
    let filter: TSQLFilter<IStationDuty> = {
      "operator": "AND",
      values: [{ StationID: StationID }]
    }
    if(date) filter.values.push({ SwitchAt: datefns.endOfDay(date).getTime(), compare: "<=" })
    return SQLServer.Table("Duty").select({
      top: 1,
      filter,
      order: { by:"DutyID", dir: "DESC" }
    }).then( res => res.recordset )
  },

  /**
   * @description This function will return recordset of GCData for specfic day
   */
  getGCData:(day:number|Date) => {
    const selectedDay = datefns.startOfDay(day).getTime();
    return SQLServer
    .Table("GCdata")
    .select({ filter: { Day: selectedDay }})
    // .runQuery(`SELECT * FROM ${SQLServer.Tables.GCdata} WHERE Day = '${selectedDay}'`) as Promise<IResult<IDBGCDATA>>
  },

  getGCDataLive: () => {
    return SQLServer
    .Table("GCdata")
    .select({ top: 1, order: { by: "Day", dir: "DESC" } })
    // .runQuery(`SELECT TOP 1 * FROM ${SQLServer.Tables.GCdata} ORDER BY Day DESC`) as Promise<IResult<IDBGCDATA>>
  },

  getGCLiveMode: () => {
    return SQLServer
      .Table("SwitchGCdata")
      .select({ top: 1, order: { by: "ID", dir: "DESC" }})
      // .runQuery(`SELECT TOP 1 * FROM ${SQLServer.Tables.SwitchGCdata} ORDER BY ID DESC`) as Promise<IResult<IDBSwitchGCdata>>
  },

  getGCDataMonth:(day:number) => {
    const sOfMonth = datefns.startOfMonth(day).getTime()
    const eOfMonth = datefns.endOfMonth(day).getTime()
    return SQLServer.Table("GCdata").select({
      filter: {
        "operator": "AND",
        values: [
          {"Day": sOfMonth, compare: ">=" }, 
          {"Day": eOfMonth, compare: "<=" }
        ]
      }
    })
    // return SQLServer.runQuery(`SELECT * FROM ${SQLServer.Tables.GCdata} WHERE Day >= '${sOfMonth}' and Day <= ${eOfMonth}`) as Promise<IResult<IDBGCDATA>>
  },
  
  getGCDataEvent: (day:number) => {
    const sOfMonth = datefns.startOfMonth(day).getTime()
    const eOfMonth = datefns.endOfMonth(day).getTime()
    return  SQLServer.Table("GCDataEvent").select({ 
      filter: {
        operator: "AND",
        values: [
          { "gcDay": sOfMonth, compare: ">=" }, 
          { "gcDay": eOfMonth, compare: "<=" }
        ]
      }
    })
    // return SQLServer.runQuery(`SELECT * FROM ${SQLServer.Tables.GCDataEvent} WHERE gcDay >= '${sOfMonth}' and gcDay <= ${eOfMonth}`) as Promise<IResult<IDBGCDATAEvent>>
  },
  // buildUpdate:<T = any>(object: T) => {
  //   return Object.entries(object).filter(([k,v]) => v!=undefined&&v!=''&&v!=null).map(([k,v]) => `"${k}"='${v}'` )
  // },
  // buildInsert: <T = any>(object: T) => {
  //   const entries = Object.entries(object).filter(([k,v]) => !Array.isArray(v)&&v!==undefined&&v!==null&&v!=='')
  //   const columns = `(${entries.map( en => `"${en[0]}"`).join(',')})`
  //   const values  = `(${entries.map( en => { 
  //     let value: string = ''
  //     if(typeof en[1] == "boolean"){
  //       value = en[1] ? '1' : '0'
  //     } else if(typeof en[1] == "number" || typeof en[1] == "string") {
  //       value = en[1].toString()
  //     } else {
  //       throw new Error(`Unable to cast ${en[1]} to string`)
  //     }
  //     return `'${value}'`
  //   }).join(',')})`
  
  //   return `${columns} VALUES ${values}; SELECT SCOPE_IDENTITY() `
  // },
  /**@description use to insert an array */
  builInsert2: <T=any>(objectArray: T[]) => {
    const firstElement = objectArray[0];
    const entries = Object.entries(firstElement).filter(([k,v]) => !Array.isArray(v)&&v!==undefined&&v!==null&&v!=='')
    const columns = `(${entries.map( en => `"${en[0]}"`).join(',')})`
    const values = objectArray.map((object, memberid) => {
      const _entries = Object.entries(object)
      return `(${_entries.map( en => { 
        let value: string = ''
        if(typeof en[1] == "boolean"){
          value = en[1] ? '1' : '0'
        } else if(typeof en[1] == "number" || typeof en[1] == "string") {
          value = en[1].toString()
        } else {
          throw new Error(`Unable to cast ${en[1]} to string at row ${memberid}`)
        }
        return `'${value}'`
      }).join(',')})`
    }).join(',')
    return `${columns} VALUES ${values}; SELECT SCOPE_IDENTITY() `
  },

  Tables: __Tables,
  Table<TB extends DKDBTables, TBT = ReturnTableType<TB>>(table: TB){
    return {
      select: (option?: ISQLQuery2<TBT>) => {
        let __select  =''; let __filter  =''; let __order   =''
        const top = option && "top" in option && option.top
        const filter = option && "filter" in option && option.filter
        const order = option  && "order" in option && option.order
        const props = option  && "props" in option && option.props

        __select = `SELECT${top ? ' TOP ' + top : ''} ${props?props.join(","):'*'} FROM ${table}`
        __filter = filter && (!("operator" in filter ) || filter.values.length > 0 ) ? ' WHERE ' + buildFilter2(filter) : ''
        
        if(order){
          __order = ' ORDER BY ' + order.by
          if(order.dir) __order += ' ' + order.dir
        }
        const query = __select + __filter + __order
        return SQLServer.runQuery(query) as Promise<IResult<TBT>>
      },
      post: (option: Partial<TBT>[]) => {
        const insertString = 'INSERT INTO ' + table + ' ' + SQLServer.builInsert2(option)
        if(table=="DataDay")console.log(insertString)
        return SQLServer.runQuery(insertString) as Promise<IDBPost<TBT>>
      },
      delete: (filter: TSQLFilter<TBT>) => {
        const __delete = 'DELETE FROM ' + table
        const __filter = filter ? ' WHERE ' + buildFilter2(filter) : ''
        const query = __delete + __filter
        return SQLServer.runQuery(query) as Promise<TDelete>
      },
      update: (option: { where?: TSQLFilter<TBT>, update: Partial<ReturnTableType<TB>> }) => {
        const { where, update } = option
        let _filter = where ? buildFilter2(where) : undefined
        const _update = buildUpdate(update)
        let query = `UPDATE ${table} SET ${_update}`;
        query += _filter ? ` WHERE ${_filter}` : ''
        return SQLServer.runQuery(query)
      }
    }
  }
};

export interface IDBPost<T>{
  recordsets: {'': number}[][],
  recordset: {'': number}[],
  output: {},
  /**@description
   * - [number, number]
   * - rowAffected[0] - number of rows added
   * - rowAffected[1] = 1: unknown
   */
  rowAffected: number[]
}
