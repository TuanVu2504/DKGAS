import { Router }  from 'express'
import * as core from 'express-serve-static-core'
import { stationConfig } from '../../../globalSettings'
import { IDB51Hourly } from '../../../Interface'
import * as datefns from 'date-fns'
import { SQLServer, DKError, StationDailyReportStore } from '../../src/toolts'

const router = Router()

type IStationDB51Post = core.Request<{ StationID: string },{}, IDB51Hourly[]>

router.route('/')
.post( async (req: IStationDB51Post, res, next) => {
  const { body } = req
  const StationID = body[0].StationID
  const Day       = body[0].Day
  const station = stationConfig.stations.find(station => station.StationID == StationID)
  if(!station){
    return next({ status: 400, message: DKError.Station.not_found(StationID) })
  }
  const dataday = await SQLServer.Table("DataDay").select({
    filter: {
      operator: "AND",values: [{ Day }, { StationID }]
    }
  }).then( rec => rec.recordset )
  if(dataday.length > 0) await SQLServer.Table("DataDay").delete({ operator: "AND", values: [{ StationID }, { Day }] })
  await SQLServer.Table("DataDay").post(body)
  .catch( console.log )
  StationDailyReportStore.requestUpdated({ 
    "type":  "station", 
    station: station, 
    date: new Date(datefns.addDays(new Date(), -1)).getTime() 
  })
  res.status(200).end()
})

export default router