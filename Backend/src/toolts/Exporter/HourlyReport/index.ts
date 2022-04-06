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
export function HourlyReport(station: IDBStation,ReportDate: string){
  return {
    excel: () => excel(station, ReportDate),
    pdf: () => pdf(station, ReportDate)
  }
}