import * as datefns from 'date-fns'
interface IScheduleTaskOption {
  /**@description the task() will be excuted at this specific time */
  time: number
  /**@description if specified, the task() will be excuted at specific time and this minute */
  minute?: number
  /**@description second: if specified, the task() will re check time timer after this interval. Default: 1 second  */
  interval?: number
  /**@description the function will be excuted */
  task: () => Promise<void>
  /**@description the name of this schedule, used to console log */
  name: string 
}

export class Scheduler {
  private time: number;
  private minute?: number;
  private interval: number;
  private name?:string;
  private task: () => Promise<void>
  private __lastrun: Date|undefined = undefined
  private __scheduledTime = new Date()

  public static schedulers: Scheduler[] = []

  constructor(options: IScheduleTaskOption){
    const _interval = (options.interval || 1) * 1000
    const _minute   = options.minute || 0
    this.time       = options.time
    this.minute     = options.minute
    this.interval   = _interval
    this.name       = options.name
    this.task       = options.task
    this.__scheduledTime.setHours( options.time, _minute )
    Scheduler.schedulers.push(this)
    this.watch()
  }

  public async watch(){
    const __today = new Date()
    if(!datefns.isSameDay(this.__scheduledTime, __today)){
      this.__scheduledTime.setFullYear(__today.getFullYear(), __today.getMonth(), __today.getDate());
    }
    if(!this.__lastrun || !datefns.isSameDay(this.__lastrun, __today)){
      let __ontime = false;
      const curminute = __today.getMinutes()
      const hour      = __today.getHours();

      __ontime = hour == this.time
      if(this.minute != undefined){
        __ontime == __ontime && this.minute == curminute
      }

      if(__ontime){
        console.log(`On time ${this.__scheduledTime}!!! running task ${this.name}`)
        try {
          await this.task()
          this.__lastrun = __today
          console.log(`finished ${this.name} at ${datefns.format(this.__lastrun, 'yyyy MMM dd, HH:mm:ss')}`)
        } catch(err){
          console.log(`Task name: ${this.name}`)
          console.log(err)
        }
      }
    }

    await new Promise(resolve => setTimeout( resolve, this.interval ))
    this.watch()
  }
}