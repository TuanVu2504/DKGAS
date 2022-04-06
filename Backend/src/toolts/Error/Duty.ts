import { IDBStation } from '../../../../Interface'

export class Duty {
  static not_found = function (station:IDBStation, date: Date){
    return `Duty for station ${station.name} on ${date.toLocaleString()} not found`
  }
}