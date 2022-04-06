import express, { NextFunction, Response } from 'express'
import * as core from 'express-serve-static-core'
import { Exporter, SQLServer, DKError } from '../../../toolts'
import { stationConfig } from '../../../../../globalSettings'
import * as datefns from 'date-fns'

const router = express.Router()
interface IGETDailyReportQuery { StationID: number, date: string }
type TGetDailyReportExcel = core.Request<{},{},{}, IGETDailyReportQuery>
router.route('/')
  .get(async(req: TGetDailyReportExcel, res: Response, next: NextFunction ) => {
    const { StationID, date } = req.query
    const dateobject = new Date(date.replace(/(\d{4})(\d{2})(\d{2})/,'$1-$2-$3'))
    const station = stationConfig.stations.find(station => station.StationID == StationID)
    if(!station) return next({ status: 404, message: 'Resource not found'})
    const duty = await SQLServer.Table("Duty").select({ 
      top: 1,
      order: { by: "DutyID", dir: "DESC" }, 
      filter: { 
        operator: "AND", 
        values: [
          { StationID: station.StationID }, 
          { "SwitchAt": datefns.endOfDay(dateobject).getTime(), compare: "<=" }
        ]
      }
    }).then( res => res.recordset[0])
    if(!duty) return next({ status: 400, message: DKError.Duty.not_found(station, dateobject)})
    const relatiPath = await Exporter.DailyReport(station,dateobject).excel()
    res.json({ excel_path: relatiPath })
  })


export default router