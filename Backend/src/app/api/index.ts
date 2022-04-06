import { Router } from 'express'
import duty from './duty'
import stations from './stations'
import gcdata from './gcdata'
import reports from './reports'
import pdf from './pdf'
import excel from './excel'
import csv from './csv'
import chart from './chart'
import connectionHistory from './connectionStatus'
import stationRealtime from './stationRealtime'

const router = Router()

router.use('/duty', duty)
router.use('/stations', stations)
router.use('/gcdata', gcdata )
router.use('/reports', reports)
router.use('/pdf', pdf )
router.use('/excel', excel)
router.use('/csv', csv)
router.use('/stationRealtime', stationRealtime)
router.use('/chart', chart )
router.use('/connectionHistory', connectionHistory)

export default router