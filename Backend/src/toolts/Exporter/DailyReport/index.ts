import { IDBStationDailyReport, IDBStation } from "../../../../../Interface";
import { pdf } from './pdf'
import { excel } from "./excel";

export function DailyReport(station: IDBStation, date: Date){
  return {
    excel: () => excel(station, date),
    pdf: () => pdf(station, date)
  }
}