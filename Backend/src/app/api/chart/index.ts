import  { Router } from 'express'
import * as core from 'express-serve-static-core'
import * as datefns from 'date-fns'
import { stationConfig } from '../../../../../globalSettings'
import { DKError, SQLServer } from '../../../toolts'
import { IStationRealTimeDataType, TSQLFilter } from '../../../../../Interface'

const grap_type = ["temp_and_press", "svf_and_gvf"] as const
const temp_and_press  = ["Time", "Tevc", "Pevc", "Tevc_02", "Pevc_02"] as (keyof IStationRealTimeDataType)[]
const svf_and_gvf     = ["Time", "SVF", "SVF_02", "GVF", "GVF_02"] as (keyof IStationRealTimeDataType)[]

const router = Router()

interface FillNANOptions {
  /**@description - second */
  max_thresh_hold?: number,
  type: typeof grap_type[number]
}
// const fillNANData = <T extends IGetSVFAndGVFChartResponse|IGetTempAndPresSChartResponse>(option: FillNANOptions) => (response: T[]) => {
//   const max_sec_dif_allow = option.max_thresh_hold || 30
//   const per_cycle = 10 // second
//   let result: T[] = []
//   if(response.length <= 1){ return response }
//   response.reduce((a,b,i) => {
//     // by default, every 'a' will always be ready to put to result
//     result = [...result, a]
//     const a_time = new Date(helper.normalLize_date_from_sql(a.Time))
//     const b_time = new Date(helper.normalLize_date_from_sql(b.Time))
//     const time_dif_size = Math.abs(a_time.getTime() - b_time.getTime())/1000
//     if(time_dif_size <= max_sec_dif_allow){
//       // allow this diff, return b to do the next check
//       return b
//     } else {
//       // count possible nulls and add to new array, also add a and b
//       const possible_nulls = Math.ceil(time_dif_size/per_cycle)
//       const null_temp_pres = Array.from(new Array(possible_nulls)).map((e,i) => {
//         const from = new Date(a_time.getTime() + (i+1)*per_cycle*1000)
//         const converted = datefns.format(from, 'yyyy-MM-dd HH:mm:ss.SSS').replace(/\s/,'T')+'Z'
//         console.log({
//           time_dif_size,per_cycle,
//           possible_nulls,
//           from: from.getTime(),
//           fromString: datefns.format(from, 'yyyy-MM-dd HH:mm:ss.SSS'), 
//           converted
//         })
//         return Object.assign(
//           { Time: converted }, 
//           option.type == "svf_and_gvf"  ? { SVF: null, SVF_02: null, GVF: null, GVF_02: null }
//                                         : { Tevc: null, Tevc_02:null, Pevc: null, Pevc_02:null }
//         )
//       })
//         // option.type == "svf_and_gvf" 
//         //   ? Array.from(new Array(possible_nulls)).map((e,i) => {  
//         //     const from = new Date(a_time.getTime() + (i+1)*per_cycle*1000)
//         //     const converted = datefns.format(from, 'yyyy-MM-dd HH:mm:ss.SSS').replace(/\s/,'T')+'Z'
//         //     console.log({
//         //       from: from.getTime(),
//         //       fromString: datefns.format(from, 'yyyy-MM-dd HH:mm:ss.SSS'), 
//         //       converted
//         //     })
//         //     return {
//         //       Time: converted,
//         //       // new Date(a_time.getTime() + (i+1)*per_cycle*1000).toISOString(),
//         //       SVF: null, SVF_02: null, GVF: null, GVF_02: null
//         //     }
//         //   })
//         //   : Array.from(new Array(possible_nulls)).map((e,i) => {  
//         //     const from = new Date(a_time.getTime() + (i+1)*per_cycle*1000)
//         //     const converted = datefns.format(from, 'yyyy-MM-dd HH:mm:ss.SSS').replace(/\s/,'T')+'Z'
//         //     console.log({
//         //       from, converted
//         //     })
//         //     return {
//         //       Time: converted,
//         //       // new Date(a_time.getTime() + (i+1)*per_cycle*1000).toISOString(),
//         //       Tevc: null, Tevc_02:null, Pevc: null, Pevc_02:null
//         //     }

//         //   })
//       result = [...result, ...null_temp_pres as unknown as T[]]
//       return b
//     }
//   })
//   return result
// }
interface IChartQuery {
  type: typeof grap_type[number],
  from: string,
  to?: string,
  max_thresh_hold?: number
}

type TChartGet = core.Request<{ StationID: string },{},{},IChartQuery>
router.route('/:StationID')
  .get((req:TChartGet, res, next) => {
    req.setTimeout(5*60*1000)
    const { query, params } = req
    const { from, to, type, max_thresh_hold } = query
    if(!type || grap_type.indexOf(type) < 0) return next({ status: 400, message: `query type=${type} is not valid` })
    if(!from) return next({ status: 400, message: `from in query is required` })
    const StationID = params.StationID
    const station = stationConfig.stations.find(station => station.StationID == +StationID)
    if(!station) return next({ status: 400, message: DKError.Station.not_found(StationID) })
    const filter: TSQLFilter<IStationRealTimeDataType> = {
      operator: "AND",
      values: [{ ID: +StationID }]
    }
    filter.values.push({ Time: datefns.startOfDay(+from).getTime(), compare: ">=" })
    if(to){ filter.values.push({ Time: datefns.endOfDay(+to).getTime(), compare: "<=" }) }

    SQLServer.Table("realtimeEVC").select({ 
      order: { by: 'rtIndex' },
      props: type == "temp_and_press" ? temp_and_press : type == "svf_and_gvf" ? svf_and_gvf : undefined,
      filter  
    }).then( res => res.recordset )
    .then(result => result.map( el => type == "temp_and_press" ? ({ 
      Time: el.Time, 
      Tevc: el.Tevc != 0 ? el.Tevc : null, 
      Pevc: el.Pevc != 0 ? el.Pevc : null,
      Tevc_02: el.Tevc_02 != 0 ? el.Tevc_02 : null,
      Pevc_02: el.Pevc_02 != 0 ? el.Pevc_02 : null
    }) : ({
      Time: el.Time, 
      SVF: el.SVF != 0 ? el.SVF : null, 
      SVF_02: el.SVF_02 != 0 ? el.SVF_02 : null,
      GVF: el.GVF != 0 ? el.GVF : null,
      GVF_02: el.GVF_02 != 0 ? el.GVF_02 : null
    })))
    // .then(fillNANData({ max_thresh_hold, type }))
    .then(result => res.status(200).json(result))
    .catch(err => next({ status: 500, message: err.message }))
  })


export default router