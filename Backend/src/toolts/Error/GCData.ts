import * as datefns from 'date-fns'

export class GCData {
  static not_found = function (Date: number){
    return `GCData on ${datefns.format(Date, 'yyyy-MM-dd')} not found`
  }
}