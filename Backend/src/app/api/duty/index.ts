
import { Router, Request } from 'express'
import { DKError, SQLServer } from '../../../toolts'
import { IDutyUpdateQuery, TSQLFilter, IStationDuty } from '../../../../../Interface'
import * as core from 'express-serve-static-core';
import * as datefns from 'date-fns'
import { WebSocketStore } from '../../../websocketHandler'
import { stationConfig } from '../../../../../globalSettings'

const wsStore = WebSocketStore.getSockets()

const router  = Router()

router.route('/')
  .put(async (req:Request<core.ParamsDictionary, {}, {}, IDutyUpdateQuery>,res) => {
    try {
      const SwitchAt = datefns.startOfDay(new Date()).getTime()
      const { LineID, StationID } = req.query;
      if(!LineID || !StationID){ 
        return res.status(400).json(`Invalid request, LineID: ${LineID} | StationID: ${StationID}`)
      }
      const station = stationConfig.stations.find( station => station.StationID == +StationID )
      if(!station) return res.status(404).json(`StationID ${StationID} not found`)

      const { Username } = req.currentUser!

      const oldEvent = await SQLServer.Table("Duty").select({
        filter: { operator: "AND", values:[{ StationID: station.StationID }, { SwitchAt }] }
      }).then( rec => rec.recordset[0])
      if(!oldEvent){
        await SQLServer.Table("Duty").post([{ StationID: +StationID, LineID: +LineID,  SwitchAt, SwitchBy: Username }])
      } else {
        await SQLServer.Table("Duty").update({ 
          where: { DutyID: oldEvent.DutyID }, 
          update: { LineID: +LineID, SwitchAt, SwitchBy: Username }
        })
      }
      

      wsStore.broadcast({
        type: "StationDutyChange",
        payload: { LineID: +LineID, ...station }
      })

      res.status(200).end()
    }
    catch(err){
      console.log(err)
      res.status(500).send("Internal server error")
      // send message to system admin here
    }
  })

  .get(async(req, res, next) => {
    const { StationID, latest } = req.query    
    let filter: TSQLFilter<IStationDuty> = {
      operator: "AND",
      values: []
    }

    if(StationID) filter.values.push({ StationID: +StationID })

    SQLServer.Table("Duty")
    .select({ 
      filter,
      order: latest ? { by: "DutyID", dir: "DESC" } : undefined,
      top: latest ? 1 : undefined
    }).then(rec => {
      res.status(200).json(rec.recordset)
    })
    .catch(err => next({ status: 500, message: err.message }))
  })

export default router