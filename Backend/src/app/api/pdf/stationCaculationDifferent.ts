import { Router } from 'express'
import * as core from 'express-serve-static-core'
import { stationConfig } from '../../../../../globalSettings'
import { DKError, Exporter } from '../../../toolts'
const router = Router()


interface IGETStationDifferntReportQuery { StationID: number, date: string }
type TGetStationDifferentPdf = core.Request<{},{},{}, IGETStationDifferntReportQuery>
router.route('/')
  .get(async(req:TGetStationDifferentPdf, res, next) => {
    const { query } = req
    const { StationID, date } = query
    const station = stationConfig.stations.find( s => s.StationID == StationID )
    if(!station) return next({ status: 404, message: DKError.Station.not_found(StationID) })
    const pdf_path = await Exporter.StationDifferent(station, new Date(date)).pdf()
    res.json({ pdf_path })
  })

export default router