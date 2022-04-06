import React from 'react'
import * as datefns from 'date-fns'
import { useDispatch } from 'react-redux'
import { IGCDataState, IDBGCDATA, IGCDataUpdate, 
  ICalendarHighLight } from '../../../../Interface'
import { gcDataDownload,
  gcDataLiveUpdate,
  gcDataUpdated,
  gcDataEventAdd
} from '../../actions'
import { api, isNumber } from '../../helpers'
import { useSelectorTyped } from '../../reducers'
import { useModal } from './useModal'
import * as DateFns from 'date-fns'



export function downloadGCData(selecteDate: Date = new Date()){
  const { authenticated } = useSelectorTyped( state => state.authentication )
  const dispatch = useDispatch()
  const [yyyy,MM,dd] = datefns.format(selecteDate,'yyyy-MM-dd').split('-')
  
  const [dateSelected, _setDay] = React.useState(datefns.startOfDay(selecteDate))
  const [montSelected, setMon] = React.useState(`${yyyy}${MM}`)

  const setDay = (_date: Date) => _setDay(datefns.startOfDay(_date))
  
  React.useEffect(() => {
    if(!authenticated) return
    const apiUrl = `/api/gcdata?Day=${dateSelected.getTime()}`
    api<IGCDataState>(apiUrl)
    .then(dat => dispatch(gcDataDownload(dat)))
  }, [montSelected, authenticated])

  React.useEffect(() => {
    if(!authenticated) return
    const newMontSele = datefns.format(dateSelected, 'yyyyMM')
    if(newMontSele == montSelected) return
    setMon(newMontSele)
  }, [dateSelected, authenticated])

  return { 
    dateSelected, 
    setDay,
  }
}

export function useGCData(dateSelected: Date){
  const dispatch          = useDispatch()
  const { confirm, warn } = useModal()
  const { gcData, gcDataLiveMode, gcDataEvent, gcDataLive } = useSelectorTyped( state => state.gcDataState )
  const thisdayGCdata                 = gcData.find(e => DateFns.isSameDay(+e.Day, dateSelected));
  const [ tempGCData, setTempGCData]  = React.useState<Omit<IDBGCDATA, "gcID"|"Day">>(thisdayGCdata||defaultGCData)

  const isLive = gcDataLiveMode.Mode == 1 ? true : false
  const monthstart  = DateFns.startOfMonth(dateSelected)
  let   nextdate    = monthstart
  const monthend    = DateFns.endOfMonth(dateSelected)
  const missingGCdata: ICalendarHighLight[] = []
  while(monthend.getTime() > nextdate.getTime()){
    if(gcData.every(gc => !DateFns.isSameDay(+gc.Day, nextdate ))){
      missingGCdata.push({ date: nextdate.getTime(), reason: "Missing gcdata" })
    }
    nextdate.setDate(nextdate.getDate() + 1)
  }

  const dataValid = Object.entries(tempGCData).filter(([k,v]) => k != "gcID" && k != "Day").every(([k, val]) => {
    return isNumber(val) && val > 0 && val < 100 ? true : false
  })
  
  React.useEffect(() => { 
    setTempGCData(thisdayGCdata||defaultGCData) 
  },[dateSelected])

  function switchLive(){
    const nextState = { Mode: gcDataLiveMode.Mode == 1 ? 0 : 1 }
    confirm(
      [`Are you sure that GCData mode will ${nextState.Mode==1?'':'not'} be in live mode?`], 
      () => fetch(`/api/gcdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(nextState)
      }).then(() => {
        if(nextState.Mode == 1){ setTempGCData(thisdayGCdata||defaultGCData) }
      })
    )
  }

  const updateGCData = React.useCallback((e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(!tempGCData) return
    if(Object.values(tempGCData).some(val => {
      return !isNumber(val) || val == 0 ? true : false
    })){
      warn(`Some of the value in your input does not match the requirements. Your input is either not a number or equal to zero!`)
      return
    }

    confirm([
      `Please confirm that you are updating new value for GCData on ${dateSelected.toLocaleDateString()}.`,
      `Your action will be recorded.`
    ], () => fetch(`/api/gcdata`, { 
      method: "POST", 
      headers: {  
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...tempGCData,
        Day: dateSelected.getTime()
      })
    })
    .then(res => res.json() as Promise<IGCDataUpdate>)
    .then(res => {
      dispatch(gcDataLiveUpdate(res.newGCData))
      dispatch(gcDataUpdated(res.newGCData))
      dispatch(gcDataEventAdd(res.newGCDataEvent))
    })
    .then(() => warn("Update gc data success"))
    // .finally(() => {
    //   setEnable("disabled")
    // })
  )}, [tempGCData, dateSelected])
  
  const sumGCData = (gc: Omit<IDBGCDATA, "gcID"| "Day">) => Math.round(
    +gc.Methan + +gc.Ethane + +gc.Propane + 
    +gc['i-Butane'] + +gc['n-butane'] + +gc['i-Pentane'] + +gc['n-Pentane'] + 
    +gc['n-hexane'] + +gc.nitrogen + +gc.carbondioxit)
  
  return {
    sumGCData,
    switchLive, 
    updateGCData, 
    setTempGCData,
    tempGCData,
    dataValid,
    gcDataLiveMode,
    isLive,
    gcDataLive,
    missingGCdata,
  }
}

const defaultGCData: Omit<IDBGCDATA, "gcID"|"Day"> = {
  "Ethane": 0,
  "Heat value": 0,
  "Methan": 0,
  "Propane": 0,
  "carbondioxit": 0,
  "i-Butane": 0,
  "i-Pentane": 0,
  "n-Pentane": 0,
  "n-butane": 0,
  "n-hexane": 0,
  "nitrogen": 0,
  "relative": 0,
}