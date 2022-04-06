import { DailyReport } from './DailyReport'
import { HourlyReport } from './HourlyReport'
import { MonthlyReport } from './MonthlyReport'
import { StationDifferent } from './StationDifferentReport'

export class Exporter {
  static DailyReport = DailyReport
  static HourlyReport = HourlyReport
  static MonthlyReport = MonthlyReport
  static StationDifferent = StationDifferent
}