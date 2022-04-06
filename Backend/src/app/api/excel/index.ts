import express from 'express'
import dailyReport from './dailyReport'
import hourlyReport from './hourlyReport'
import monthlyReport from './monthlyReport'
import stationCaculationDifferent from './stationCaculationDifferent'

const router = express.Router()
router.use('/dailyReport', dailyReport)
router.use('/hourlyReport', hourlyReport)
router.use('/monthlyReport', monthlyReport)
router.use('/stationCaculationDifferent', stationCaculationDifferent)

export default router