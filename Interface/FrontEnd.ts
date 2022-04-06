
export interface ICalendarHighLight {
  date: number,
  reason?: string
}
export interface IDropCalendar {
  onClick: (date:number) => any, 
  /**@description start of this month */
  onMonthChange?: (month: Date) => void
  dateSelected?: number,
  btnClassName?:string,
  highlight?:ICalendarHighLight[],
  className?:string,
  children?: string,
  requireConfirm?: boolean
}