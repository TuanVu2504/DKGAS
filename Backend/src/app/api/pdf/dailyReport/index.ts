import { Router, Response, NextFunction  } from 'express'
import * as core from 'express-serve-static-core'
import { Exporter, SQLServer, DKError } from '../../../../toolts'
import { stationConfig } from '../../../../../../globalSettings'
import * as datefns from 'date-fns'

const router = Router()
interface IGETDailyReportQuery { StationID: number, date: string }
type TGETDailyReportPdf = core.Request<{},{},{},IGETDailyReportQuery>
router.route('/')
  .get(async(req:TGETDailyReportPdf, res: Response, next: NextFunction) => {
    const { StationID, date } = req.query
    const dateobj = new Date(date.replace(/(\d{4})(\d{2})(\d{2})/,'$1-$2-$3'))
    // const StationDailyReport = await StationDailyReportStore.get(StationID, date)
    const station = stationConfig.stations.find(station => station.StationID == StationID)
    if(!station) return next({ status: 404, message: 'Resource not found'})
    const duty = await SQLServer.Table("Duty").select({ 
      top: 1,
      order: { by: "DutyID", dir: "DESC" }, 
      filter: { 
        operator: "AND", 
        values: [
          { StationID: station.StationID }, 
          { "SwitchAt": datefns.endOfDay(dateobj).getTime(), compare: "<=" }
        ]
      }
    }).then( res => res.recordset[0])
    if(!duty) return next({ status: 400, message: DKError.Duty.not_found(station, dateobj)})
    const relatiPath = await Exporter.DailyReport(station, dateobj).pdf()
    res.json({ pdf_path: relatiPath})
  })


export default router