import { NextFunction, Request, Response } from 'express'
import * as core from 'express-serve-static-core'
import { SQLServer } from '../../../toolts'
import { IDBUpstreamMonthlyManualReport } from '../../../../../Interface'

type TUpstreamGET = core.Request<{}, {},{},{ from: string, to: string }>
export async function getUpStreamMonthlyUsuage(req: TUpstreamGET, res: Response, next: NextFunction) {
  const { from, to } = req.query
  const data = await SQLServer.Table("ReportUpstreamMonthlyManual").select({ filter: { 
    "operator": "AND",
    values: [{ Date: +from, compare: ">=" }, { Date: +to, compare: "<=" }]
  }}).then( res => res.recordset )
  res.json(data)
}

type TUPStreamPost = core.Request<{},{},Pick<IDBUpstreamMonthlyManualReport, "TotalVolumeManual">, Pick<IDBUpstreamMonthlyManualReport, "Date">>
export async function postUpStreamMonthlyUsuage(req: TUPStreamPost, res: Response, next: NextFunction) {
  const { Date } = req.query
  const { TotalVolumeManual } = req.body

  console.log({ 
    Date, TotalVolumeManual
  })
  const day_upstream = await SQLServer.Table("ReportUpstreamMonthlyManual").select({ filter: {
    Date: Date
  }}).then( res => res.recordset[0])
  if(!day_upstream) {
    const newlyID = await SQLServer.Table("ReportUpstreamMonthlyManual").post([{ Date, TotalVolumeManual }])
    .then(res => {
      console.log(res)
      return res
    })
    .then( res => Object.values(res.recordset[0])[0])
    res.json({ Date, TotalVolumeManual, ID: newlyID })
  } else {
    await SQLServer.Table("ReportUpstreamMonthlyManual").update({
      where: { Date }, update: { TotalVolumeManual }
    })
    day_upstream.TotalVolumeManual = TotalVolumeManual
    res.json(day_upstream)
  }
}