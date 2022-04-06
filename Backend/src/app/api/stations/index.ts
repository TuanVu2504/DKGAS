import { Router } from 'express'
import * as core from 'express-serve-static-core'
import { IViewStation } from '../../../../../Interface'
import { SQLServer } from '../../../toolts'
import { stationConfig } from '../../../../../globalSettings'

interface IStationGetQuery {
  latest?: boolean
}
type TStationGetRequest = core.Request<{},{},{},IStationGetQuery>

const router = Router()

router.route('/')
  .get(async(req:TStationGetRequest,res,next) => {
    const { query } = req
    const response:IViewStation[] = await Promise.all( stationConfig.stations.map( async station => { 
      const dbRealTime_get          = query.latest 
                                      ? SQLServer.Table("realtimeEVC").select({ 
                                        top: 1, 
                                        order: { by:"rtIndex", dir: "DESC" }, 
                                        filter: { ID: station.StationID }}).then(result => result.recordset) 
                                      : SQLServer.Table("realtimeEVC").select({ filter: { ID: station.StationID }}).then( rec => rec.recordset )
      const dbLineStatus_get        = SQLServer.getDutyStatus(station.StationID, new Date());
      const dbConnectionStatus_get  = query.latest 
                                      ? SQLServer.getConnectionStatus(station.StationID)
                                      : SQLServer.Table("ConnectionHistory")
                                                  .select({ filter: { ID: +station.StationID }})
                                                  .then( rec => rec.recordset )
      
      const [dbRealTime,dbLineStatus,dbConnectionStatus] = await Promise.all([dbRealTime_get,dbLineStatus_get, dbConnectionStatus_get])
      return { 
        ...station,
        connectionStatus: dbConnectionStatus,
        realTime: dbRealTime,
        LineID: dbLineStatus.length > 0 ? dbLineStatus[0].LineID : 1
      }
    }))

    res.status(200).json(response)
  })

export default router