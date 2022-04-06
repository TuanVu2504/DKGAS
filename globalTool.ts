import { Entry } from './Interface'
import * as datefns from 'date-fns'

export const helper = {
  entries : <T>(ent: T) => Object.entries(ent) as Entry<T>,
  keys: <T>(ent: T) => Object.keys(ent) as (keyof T)[],
  yesterday: (date: Date): number => { 
    const _date = new Date(date)
    return _date.setDate(_date.getDate()-1) 
  },
  sortLargeToSmall: <T>(option: { by: keyof T }) => {
    const by = option.by
    return (a:T,b:T):number => {
      return +a[by] > +b[by] ? -1: 0
    }
  },
  sortSmallToLarge: <T>(option: { by: keyof T }) => {
    const by = option.by
    return (a:T,b:T):number => {
      return +a[by] > +b[by] ? 1 : 0
    }
  },
  getDaysOfMonths: (date: Date|number) => {
    const endOfMonth  = datefns.endOfMonth(date)
    let day           = datefns.startOfMonth(date)
    const days: Date[] = []
    while(day <= endOfMonth){ 
      days.push(new Date(day)); 
      day = datefns.addDays(day, 1) 
    }
    return days
  }
}