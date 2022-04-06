import { IDBStation } from "../../../../Interface";


export class DailyReport {
  static not_found(station: IDBStation, date: string, LineID: number){
    return `Daily report for station ${station.name} on date: ${date} for LineID ${LineID} not found`
  }
}