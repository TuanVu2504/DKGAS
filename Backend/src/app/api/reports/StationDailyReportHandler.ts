import {  Response, NextFunction } from 'express'
import * as core from 'express-serve-static-core'
import { IDB51Hourly, IDBGCDATA, IDBStation, IDBVolumeStationManual, IStationDuty } from '../../../../../Interface'
import { SQLServer, StationDailyReportStore } from '../../../toolts'

interface IDailyReportQuery {
  date: string,
  StationID?: string
}


type TRequestGetDailyReport = core.Request<{},{},{}, IDailyReportQuery>
export async function getStationDailyReport(req: TRequestGetDailyReport,res: Response,next: NextFunction) {
  const { date, StationID } = req.query
  if(!/\d{8}/.test(date) && !/\d{6}/.test(date)) return next({ status: 400, message: `The query does not valid. Got: ${date}. Required: \\d{8} or \\d{6}`})
  try {
    const StationDailyReport = await StationDailyReportStore.get(date, StationID)
    res.status(200).json(StationDailyReport)
  } catch(err){ res.status(500).end() }
}

export interface IGetRequestStationManualQuery {
  from: string,
  to: string
}
export type TGetRequestStationManual = core.Request<Pick<IDBStation, "StationID">, {},{}, IGetRequestStationManualQuery>
export async function getStationManual(req: TGetRequestStationManual, res: Response, next: NextFunction) {
  const { StationID } = req.params
  const { from, to } = req.query

  if(!req.query.from || !req.query.to || 
  [req.query.from, req.query.to].some(query => !/^\d+$/.test(query+""))){
    return next({ status: 400, message: `Query is not valid from: ${from}, to: ${to}`})
  }

  StationDailyReportStore.Manual
    .getManual(StationID, { from: +from, to: +to })
    .then(manual_reports => res.status(200).json(manual_reports))
    .catch(err => next({ status: 500, message: err.message }))
}


export type TPostRequestStationManual = core.Request<{},{},Omit<IDBVolumeStationManual, "ID">, { date: string }>
export async function postStationManual(req: TPostRequestStationManual, res: Response, next: NextFunction) {
  const { body } = req
  await StationDailyReportStore.Manual.delManual(body.StationID, { from: +body.Date, to: +body.Date })
  SQLServer.Table("ReportVolumeStationManual").post([req.body])
    .then(op => Object.values(op.recordset[0])[0])
    .then(ID => res.status(200).json({ ...req.body, ID }))
    .catch(err => next({ status: 500, message: err.message }))
}


type TRequestGetDB51Hourly = core.Request<Pick<IDBStation, "StationID">,{},{},{}>
export async function getDB51Hourly(req: TRequestGetDB51Hourly, res: Response, next: NextFunction){
  const query = req.query
  const { StationID } = req.params
  let data: IDB51Hourly[];
  // if(!("year" in query) && !("month" in query) && !("day" in query)){
  //   return next({ status: 400, message: 'null filter is not allowed' })
  // } else if( !("year" in query) && !("month" in query) && "day" in query){
  //   return next({ status: 400, message: 'month and year is required if day specified' })
  // } else if( !("year" in query) && "month" in query){
  //   return next({ status: 400, message: 'year is required if month is specified' })
  // }
  try {
    data = await SQLServer.Table("DataDay").select({ filter:{ StationID: StationID } }).then(res => res.recordset  )
    res.status(200).json(data)
  } catch(err: any) { 
    next({ status: 500, message: err.message }) 
  }
}