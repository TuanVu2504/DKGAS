import React from 'react'
import { DropCalendar } from './Elements'
import { useSelectorTyped } from '../reducers'
import { useLocation } from 'react-router-dom'
import { useGCData, GCTOName, GCUnit } from './hook'
import { isNumber } from '../helpers'
import { IDBGCDATA } from '../../../Interface'

const Col1 = (props:React.PropsWithChildren<any>) => <div className="col1 flex middle-row">{props.children}</div>
const Col2 = (props:React.PropsWithChildren<{ onClick?: () => void, className?:string }>) => {
  let cClass = "flex1 flex middle-row middle-col"
  if(props.onClick) cClass += ' pointer'
  if(props.className) cClass += ' ' + props.className
  return <div onClick={props.onClick} className={cClass}>
    {props.children}
</div>
}


export const GCData = React.memo((props: { dateSelected: Date, setDay: (d: Date) => void }) => {
  const { dateSelected, setDay }      = props
  const { 
    tempGCData, 
    setTempGCData, 
    updateGCData, 
    switchLive,
    sumGCData,
    dataValid,
    isLive,
    missingGCdata,
    gcDataLive,
  } = useGCData(dateSelected)
  const { state } = useLocation<{gcDataDate?:Date}>()
  const gcDataDate = state && state.gcDataDate ? state.gcDataDate : undefined
  
  React.useEffect(() => { if(gcDataDate) setDay(gcDataDate)}, [gcDataDate])

  return <div className="flex flex-dir-row innerflex gcdata mg40p">
    <div className="data flex1 flex flex-dir-col">
      <div className="control flex mg-top20p">
        <DropCalendar 
          onMonthChange={startofmonth => setDay(startofmonth)}
          highlight={ missingGCdata }
          dateSelected={dateSelected.getTime()}
          className="hei40p middlerow"
          onClick={ d => setDay(new Date(d))} 
        />
      </div>
      <div className="row headerrow flex flex-dir-row pd-top20p pd-bot20p h-color fmbold">
        <Col1></Col1>
        <Col2 className={`${isLive ?'active':''}`} onClick={ switchLive }>LIVE</Col2>
        <Col2 className={`${!isLive?'active':''}`} onClick={ switchLive }>KEYPAD</Col2>
        <Col2>UNIT</Col2>
      </div>
      <form className="flex flex-dir-col innerflex" onSubmit={ updateGCData }>
        <div className="innerflex ovfa">
          <GCDataRow tempGCData={tempGCData} setTempGCData={setTempGCData} gKey="Methan" />
          <GCDataRow tempGCData={tempGCData} setTempGCData={setTempGCData} gKey="Ethane" />
          <GCDataRow tempGCData={tempGCData} setTempGCData={setTempGCData} gKey="Propane" />
          <GCDataRow tempGCData={tempGCData} setTempGCData={setTempGCData} gKey="i-Butane"/>
          <GCDataRow tempGCData={tempGCData} setTempGCData={setTempGCData} gKey="n-butane"/>
          <GCDataRow tempGCData={tempGCData} setTempGCData={setTempGCData} gKey="i-Pentane"/>
          <GCDataRow tempGCData={tempGCData} setTempGCData={setTempGCData} gKey="n-Pentane"/>
          <GCDataRow tempGCData={tempGCData} setTempGCData={setTempGCData} gKey="n-hexane"/>
          <GCDataRow tempGCData={tempGCData} setTempGCData={setTempGCData} gKey="nitrogen"/>
          <GCDataRow tempGCData={tempGCData} setTempGCData={setTempGCData} gKey="carbondioxit"/>
          <GCDataRow tempGCData={tempGCData} setTempGCData={setTempGCData} gKey="Heat value"/>
          <GCDataRow tempGCData={tempGCData} setTempGCData={setTempGCData} gKey="relative"/>
          <div className="row flex flex-dir-row datarow"> 
            <div className="col1 flex middle-row">Total</div>
            <div className="flex1 flex middle-row middle-col">{sumGCData(gcDataLive)}</div>
            <div className="flex1 flex middle-row middle-col">{sumGCData(tempGCData)}</div>
            <div className="flex1 flex middle-row middle-col">%</div>
          </div>
        </div>
        <div className="flex flex-dir-row middle-col mg-top40p mg-bot40p end">
          <input
            value="Save"
            type="submit" 
            className={`button flex middle-row ${isLive || !dataValid ? 'disabled' : ''}`} />
        </div>
      </form>
    </div>

  </div>
})

interface IGCProp {
  setTempGCData: React.Dispatch<React.SetStateAction<Omit<IDBGCDATA, "gcID"|"Day">>>
  tempGCData: Omit<IDBGCDATA, "gcID"|"Day">
  gKey: keyof Omit<IDBGCDATA, "gcID"|"Day">
}

const GCDataRow = (props: IGCProp) => {
  const { gcDataLive, gcDataLiveMode } = useSelectorTyped( state => state.gcDataState )
  const { setTempGCData, tempGCData, gKey } = props
  const isLive = gcDataLiveMode.Mode == 1 ? true : false

  const gcVal = tempGCData[gKey]
  const valid = isNumber(gcVal) && 0 < +gcVal && +gcVal < 100 ? true : false
  
  const _onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTempGCData( s => ({ ...s, [gKey]: e.target.value }) )
  }, [])

  return (
    <div className="row flex flex-dir-row datarow">
      <Col1>{GCTOName[gKey]}</Col1>
      <Col2>{gcDataLive[gKey]}</Col2>
      <Col2><div className={`input  ${!valid && !isLive ? 'invalid': ''}`}>
        <input 
          className={`${isLive ? 'disabled' : ''}`}
          pattern="[0-9.]+"
          title='Allow 0-9 and "."'
          required={true}
          type="text"
          onChange={ _onChange } 
          value={ gcVal } />
        </div>
      </Col2>
      <Col2>{GCUnit(gKey)}</Col2>
    </div>
  )
}