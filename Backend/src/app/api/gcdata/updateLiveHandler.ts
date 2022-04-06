import { SQLServer } from '../../../toolts'
import { Request, Response, NextFunction } from 'express'
import * as core from 'express-serve-static-core'
import { IDBGCDATA } from '../../../../../Interface'
import { IRecordSet, IResult } from 'mssql'
import {  WebSocketStore } from '../../../websocketHandler'

export async function updateGCDataLive(req: core.Request<{},{},IDBGCDATA|{ Mode: "1"|"0" }>, res: Response,next: NextFunction){
  if("Mode" in req.body) {
    const wsStore = WebSocketStore.getSockets()
    const currentUser = req.currentUser!
    const today = new Date()
    const Mode = req.body.Mode == "0" ? 0 : 1
    const operation = await SQLServer.Table("SwitchGCdata").post([{
      Mode, SwitchBy: currentUser.Username, SwitchAt: today.getTime()
    }])
    // .runQuery(`INSERT INTO ${SQLServer.Tables.SwitchGCdata} ${SQLServer.buildInsert({
    //   Mode: req.body.Mode,
    //   SwitchBy: currentUser.Username,
    //   SwitchAt: today.getTime()
    // })}`) as IResult<IRecordSet<{"": string}>>

    const newID = +Object.values(operation.recordset[0])[0]
    wsStore.broadcast({
      "type": "GCDataSwitchLive",
      payload: {
        "ID": newID,
        "Mode": +req.body.Mode as (0|1),
        "SwitchAt": today.getTime(),
        "SwitchBy": currentUser.Username
      }
    })
    res.end()
  }
}