import { Router } from 'express'
import * as core from 'express-serve-static-core'
import { stationConfig } from '../../../../../globalSettings'
import { SQLServer, DKError } from '../../../toolts'

const router = Router()

type TStationConnectionHistory = core.Request<{ StationID: string }, {},{},{}>
router.get('/:StationID', async (req:TStationConnectionHistory, res, next) => {
  const { StationID } = req.params
  if(!StationID) return next({ status: 400, message: `StationID is required in params` })
  const station = stationConfig.stations.find( s => s.StationID == +StationID)
  if(!station) return next({ status: 400, message: DKError.Station.not_found(StationID) })

  const connection_history = await SQLServer.Table("ConnectionHistory").select({ order: { by: "hIndex", dir: "DESC" }, filter:{ "ID": +StationID }}).then( rec => rec.recordset )
  res.json(connection_history)
})

export default router