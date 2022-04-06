import { SQLServer, tools, StationDailyReportStore, Exporter } from '../../toolts'
import * as datefns from 'date-fns'
import { helper } from '../../../../globalTool'
import { stationConfig } from '../../../../globalSettings'

// SQLServer.Table("SwitchGCdata")
// // .delete({
// //   operator: "OR",
// //   values: [{ ID: 135 }, { ID: 134 }]
// // })

// .select({ 
//   top: 1,
//   order: { by: "SwitchAt", dir: "DESC" }
// }).then( res => res.recordset )
// .then( console.log )

// SQLServer.Table("Duty").delete({ 
//   operator: "OR",
//   values: [{ DutyID: 129 }, { DutyID: 130 }]
// }).then( res => console.log(res.r))

async function fix(){

  // const station = stationConfig.stations.find(s => s.StationID == 71)!
  // await Exporter.StationDifferent(station, new Date('2021-12-02')).excel().then(console.log)
  // console.log(`done`)
  for(const station of stationConfig.stations){
    console.log(`working on station ${station.name}`)
    const days = tools.getDaysOfMonths(new Date('2021-11-01'))
    for(const day of days){
      const startofDay = datefns.startOfDay(day)
      console.log(`working on station ${station.name} day ${datefns.format(startofDay, 'yyyy MM dd')}`)
      await StationDailyReportStore.requestUpdated({ type: "station", date: startofDay.getTime(), station })
    }
  }
  console.log(`done`)
}

fix()