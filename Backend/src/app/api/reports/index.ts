import { Router } from 'express'
import { 
  getStationDailyReport,
  getStationManual, postStationManual, getDB51Hourly
 } from './StationDailyReportHandler'

import { getUpStreamMonthlyUsuage, postUpStreamMonthlyUsuage } from './upstreamHandler'

const router = Router()

router.route('/stations')
  .get(getStationDailyReport)

router.route('/stationManual/:StationID')
  .get(getStationManual)
  .post(postStationManual)

router.route('/db51Hourly/:StationID')
  .get(getDB51Hourly)

router.route('/upstream')
  .get(getUpStreamMonthlyUsuage)
  .post(postUpStreamMonthlyUsuage)

export default router