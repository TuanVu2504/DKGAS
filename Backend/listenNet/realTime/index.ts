import { Router } from 'express'
import * as core from 'express-serve-static-core'
import { stationConfig } from '../../../globalSettings'
import { DKError, SQLServer } from '../../src/toolts'
import fetch from 'node-fetch'
import { IStationRealTimeDataType } from '../../../Interface'
type IStationRealTimePost = core.Request<{ StationID: string }, {}, IStationRealTimeDataType>


const router = Router()

router.route('/')
.post( async (req: IStationRealTimePost, res, next) => {
  const { body } = req
  // console.log(body)
  const station = stationConfig.stations.find(station => station.StationID == body.ID)
  if(!station){
    console.log(DKError.Station.not_found(body.ID))
    return next({ status: 400, message: DKError.Station.not_found(body.ID) })
  }
  const [
    connectionStatus,
    insertedRealtime
  ] = await Promise.all([ 
    SQLServer.getConnectionStatus(station.StationID),
    SQLServer.postStationRealTimeLatest(body)
  ])

  fetch(`http://localhost:4444/api/stationRealtime/${station.StationID}`, { 
    headers: { 
      "Content-Type": 'application/json',
      cookie: 'dkgas=1loveyouvt123'
    },
    method: "POST",
    body: JSON.stringify({
      type: "StaionRealTimeUpdate",
      payload: [{
        ...station,
        "realTime": [insertedRealtime],
        connectionStatus
      }]
    })
  }).then(res => {
    if(!res.ok){
      console.log(res.statusText)
    }
  }).catch(err => {
    console.log(err.message)
  })
  res.status(200).end()
})

export default router