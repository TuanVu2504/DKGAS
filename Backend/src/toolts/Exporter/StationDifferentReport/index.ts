import { IDBStation } from "../../../../../Interface";
import { excel } from "./excel";
import { pdf } from './pdf'

/**
 * 
 * @param station 
 * @param ReportDate \d{4}\d{2}\d{2}
 * @param data 
 * @returns 
 */
export function StationDifferent(station: IDBStation,date: Date){
  return {
    excel: () => excel(station, date),
    pdf: () => pdf(station, date)
  }
}