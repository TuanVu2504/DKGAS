import { Router, Request } from 'express'
import * as core from 'express-serve-static-core'
import * as datefns from 'date-fns'
import { updateGCDataLive } from './updateLiveHandler'
import { 
  IGCDATAQuery, IDBGCDATA, 
  IGCDataUpdate, IDBGCDATAEvent, 
  IDBGCDATAEventParse
} from '../../../../../Interface'
import { SQLServer, StationDailyReportStore } from '../../../toolts'

const router = Router()

router.route('/')
  .get(async (req: Request<core.ParamsDictionary,{},{},IGCDATAQuery>, res,next) => {
    const { Day } = req.query
    const GCData        = await SQLServer.Table("GCdata").select({
      filter: {
        "operator": "AND",
        "values": [
          { "Day": datefns.startOfMonth(+Day).getTime(),  "compare": ">=" }, 
          { "Day": datefns.endOfMonth(+Day).getTime(), "compare": "<=" }
        ]
      }
     
    })
    const gcDataEvent   = await SQLServer.getGCDataEvent(+Day)
    const gcDataLive    = await SQLServer.getGCDataLive();
    const gcSwitchData  = await SQLServer.getGCLiveMode();
    const ress = {
      gcData:GCData.recordset, 
      gcDataEvent:gcDataEvent.recordset,
      gcDataLive: gcDataLive.recordset[0],
      "gcDataLiveMode": gcSwitchData.recordset[0]
    }
    res.json(ress)
  })

  .post(async(req: core.Request<{},{},IDBGCDATA|{ Mode: "1"|"0" }>, res, next) => {
    const { body } = req
    if("Mode" in body){
      return updateGCDataLive(req, res, next)
    }
    
    const { Day } = body
   
    let action: "add" | "update" = "add"
    const GCData = await SQLServer.getGCData(+Day)
    const userID = req.currentUser!.Username
    let newGCDataID = GCData.recordset[0] ? GCData.recordset[0].gcID : 0

    if(GCData.recordset.length == 0){
      action = "add"
      const res = await SQLServer.Table("GCdata").post([body])
      newGCDataID = +Object.values(res.recordset[0])[0]
    } else {
      action = "update"
      const { Day, gcID, ...update } = body
      await SQLServer.Table("GCdata").update({ where: { gcID }, update })
    }

    await StationDailyReportStore.requestUpdated({ "type": "gcdata", "date": datefns.startOfDay(+Day).getTime() })

    const newGCDataEventPayload: Omit<IDBGCDATAEvent, "eventID"> = {
      gcDay: Day, 
      payload: JSON.stringify(req.body), 
      whenChanged: new Date().getTime(), 
      userID: userID   
    }
  
    const op = await SQLServer.Table("GCDataEvent").post([newGCDataEventPayload])
    const newGCData: IDBGCDATA = { ...body, gcID: newGCDataID }
    const newGCDataEvent: IDBGCDATAEventParse = { ...newGCDataEventPayload, eventID: +Object.values(op.recordset[0])[0], payload: body }
    const gcDataLive = await SQLServer.getGCDataLive()
    
    const response: IGCDataUpdate = { newGCData, newGCDataEvent, gcDataLive: gcDataLive.recordset[0] }
    res.json(response)
  })

export default router
