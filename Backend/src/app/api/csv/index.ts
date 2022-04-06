import { Router, Response, NextFunction } from 'express';
import * as core from 'express-serve-static-core'
import { SQLServer, StationDailyReportStore } from '../../../toolts'
import { IDB51Hourly } from '../../../../../Interface';
import { stationConfig } from '../../../../../globalSettings';

const router = Router()

router.route('/')
  .post(csvPostHandler)


type TCSVDB51PostRequest = core.Request<{},{},IDB51Hourly[],{ type: "db51" }>
type TCSVPostRequest = TCSVDB51PostRequest
export  async function csvPostHandler(req: TCSVPostRequest, res: Response, next: NextFunction){
  const { type }   = req.query
  const error = (message: string) => next({ status: 400, message })

  if(!type) return error(`csv type is required`)

  switch(type){
    case "db51": {
      const { StationID, Day } = req.body[0]
      // const date = Day.replace(/(\d{4})(\d{2})(\d{2})/,'\$1-\$2-\$3')
      const station = stationConfig.stations.find(_station => _station.StationID == StationID)
      if(!station) return error(`Unable to find any station with StationID=${StationID}`)

      if(!/(\d{4})(\d{2})(\d{2})/.test(Day)) return error(`Invalid day provide: ${Day}. Accept yyyyMMdd`)
      const [,yyyy,MM,dd] = Day.match(/(\d{4})(\d{2})(\d{2})/)!
      const oldDataDay = await SQLServer.Table("DataDay")
                                  .select({ filter: { operator: "AND", values:[{ StationID: station.StationID }, { Day: Day }]}})
                                  .then( rec => rec.recordset )

      // delete db51 if already exist to override it
      if(oldDataDay.length > 0) await SQLServer.Table("DataDay").delete({ 
        operator: "AND", 
        values: [{ StationID }, { Day }] 
      })
      // let sqlCommand = `INSERT INTO ${SQLServer.Tables.DataDay} ${SQLServer.builInsert2(data)}`
      await SQLServer.Table("DataDay").post(req.body)
      await StationDailyReportStore.requestUpdated({ type: "station", date: new Date().setFullYear(+yyyy,+MM,+dd), station: station })
      res.json(req.body)
    }

    default: {
      return error(`${type} is unknown`)
    }
  }
}

export default router