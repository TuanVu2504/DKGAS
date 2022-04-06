import React from 'react'
import * as datefns from 'date-fns'
import { api } from '../../helpers'
import { useModal } from '../hook';
import { IDBStation, IStationDuty } from '../../../../Interface';

export function useStationDuty(station: IDBStation, date: Date = new Date()){
  const [dutyEvents, setDutyEvent] = React.useState<IStationDuty[]>([])
  const month = date.getMonth()+1
  const { BlockUserInteraction, apiError, close } = useModal()
  
  const previousEvent   = dutyEvents.filter(event => event.SwitchAt <= datefns.endOfDay(date).getTime())                            
  const dutyCurrentDay  = previousEvent.length == 0 ? undefined : previousEvent.reduce((a,b) => a.SwitchAt > b.SwitchAt ? a : b)
  
  React.useEffect(() => { 
    BlockUserInteraction(`Getting Duty information for station ${station.name.toUpperCase()}`, "Loading")
    api<IStationDuty[]>(`/api/duty?StationID=${station.StationID}`)
    .then(setDutyEvent)
    .then(close)
    .catch(apiError)
  }, [station, month])

  return {
    dutyEvents,
    dutyCurrentDay
  }
}