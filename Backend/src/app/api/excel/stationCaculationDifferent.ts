import express, { NextFunction, Response } from 'express'
import * as core from 'express-serve-static-core'
import { Exporter } from '../../../toolts'
import { stationConfig } from '../../../../../globalSettings'

const router = express.Router()
interface IGETDailyReportQuery { StationID: number, date: string }
type TGetDailyReportExcel = core.Request<{},{},{}, IGETDailyReportQuery>
router.route('/')
  .get(async(req: TGetDailyReportExcel, res: Response, next: NextFunction ) => {
    const { StationID, date } = req.query
    const station = stationConfig.stations.find(station => station.StationID == StationID)
    if(!station) return next({ status: 404, message: 'Station not found'})
    const excel_path = await Exporter.StationDifferent(station, new Date(date)).excel()
    res.json({ excel_path })
  })


export default router