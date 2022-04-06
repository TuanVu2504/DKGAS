import React from 'react'
import { IDBStation } from '../../../Interface'
import { useSelectorTyped } from '../reducers'
import * as datefns from 'date-fns'
import { mapProToUnit } from './hook'

function _CMetering (){
  const stations = useSelectorTyped( s => s.stationsState )
  return <div className="table pd40p flex flex-dir-col flex1">
    <div className="header row flex flex-dir-row">
      <div className="cell name">Customer</div>
      <div className="cell pit">PIT-01</div>
      <div className="cell tit">TIT-01</div>
      <div className="cell svf">SVF-01</div>
      <div className="cell gvf">GVF-01</div>
      <div className="cell pit">PIT-02</div>
      <div className="cell tit">TIT-02</div>
      <div className="cell svf">SVF-02</div>
      <div className="cell gvf">GVF-02</div>
      <div className="cell p">% <span className="s_char delta">&#x25B2;</span>P</div>
      <div className="cell t">% <span className="s_char delta">&#x25B2;</span>T</div>
      <div className="cell gvf">% <span className="s_char delta">&#x25B2;</span>GVF</div>
      <div className="cell svf">% <span className="s_char delta">&#x25B2;</span>SVF</div>
      <div className="cell time">Time</div>
    </div>
    {
      stations.filter(station => [67,62,72].every(s => station.StationID != s )).map( station => {
        const { realTime } = station
        const stationRealTime = realTime[0] ? realTime[0] : undefined
        const Pevc     = stationRealTime ? stationRealTime.Pevc    : 0
        const Pevc_02  = stationRealTime ? stationRealTime.Pevc_02 : 0
        const Tevc     = stationRealTime ? stationRealTime.Tevc    : 0
        const Tevc_02  = stationRealTime ? stationRealTime.Tevc_02 : 0
        const GVF      = stationRealTime ? stationRealTime.GVF     : 0
        const GVF_02   = stationRealTime ? stationRealTime.GVF_02  : 0
        const SVF      = stationRealTime ? stationRealTime.SVF     : 0
        const SVF_02   = stationRealTime ? stationRealTime.SVF_02  : 0
        const Time     = stationRealTime ? datefns.format(+stationRealTime.Time, 'yyyy-MM-dd HH:mm:ss')
                                          : 0

        const deltaPevc =   Pevc  != 0 ? ((Math.abs(Pevc - Pevc_02)/Pevc)*100).toFixed(4)  : "NAN"
        const deltaTevc =   Tevc  != 0 ? ((Math.abs(Tevc - Tevc_02)/Tevc)*100).toFixed(4)  : "NAN"
        const deltaGVF  =   GVF   != 0 ? ((Math.abs(GVF - GVF_02)/GVF)*100).toFixed(4)     : "NAN"
        const deltaSVF  =   SVF   != 0 ? ((Math.abs(SVF - SVF_02)/SVF)*100).toFixed(4)     : "NAN"

        const isDPevcAlarm  = deltaPevc != "NAN" && +deltaPevc > 0.75  ? 'alarm' : ''
        const isDTevcAlarm  = deltaTevc != "NAN" && +deltaTevc > 0.75  ? 'alarm' : ''
        const isDGvfAlarm   = deltaGVF  != "NAN" && +deltaGVF  > 0.75  ? 'alarm' : ''
        const isDSvfAlarm   = deltaSVF  != "NAN" && +deltaSVF  > 0.75  ? 'alarm' : ''

        return <div key={station.StationID} className="row">
          <div className="cell name">{ station.name}</div>
          <div className="cell pit">{ Pevc.toFixed(4) }</div>
          <div className="cell tit">{ Tevc.toFixed(4) }</div>
          <div className="cell svf">{ SVF.toFixed(4) }</div>
          <div className="cell gvf">{ GVF.toFixed(4) }</div>
          <div className="cell pit">{ Pevc_02.toFixed(4) }</div>
          <div className="cell tit">{ Tevc_02.toFixed(4) }</div>
          <div className="cell svf">{ SVF_02.toFixed(4) }</div>
          <div className="cell gvf">{ GVF_02.toFixed(4) }</div>
          <div className={`cell p ${isDPevcAlarm}`}>{ deltaPevc }</div>
          <div className={`cell t ${isDTevcAlarm}`}>{ deltaTevc }</div>
          <div className={`cell gvf ${isDGvfAlarm}`}>{ deltaGVF }</div>
          <div className={`cell svf ${isDSvfAlarm}`}>{ deltaSVF }</div>
          <div className="cell time">{ Time }</div>
      </div>
      })
    }
  </div>
}

export const CMetering = React.memo( _CMetering )



const Col1 = (props:React.PropsWithChildren<any>) => <div className="col1 flex middle-row">{props.children}</div>
const Col2 = (props:React.PropsWithChildren<any>) => <div className="flex1 flex middle-row middle-col">{props.children}</div>

const Header = (props: { station?:IDBStation }) => {
  const { station } = props
  const stationType = station ? station.type : 'FC'
  const StationID = station ? station.StationID : '60'
  const stationLine1 = `${stationType}-${StationID}01`
  const stationLine2 = `${stationType}-${StationID}02`

  return <div className="row headerrow flex flex-dir-row mg-top20p">
    <Col1></Col1>
    <Col2>{stationLine1}</Col2>
    <Col2>{stationLine2}</Col2>
    <Col2>TIME</Col2>
  </div>
}
interface IRow {
  name: string,
  val1?: number|string,
  val2?: number|string,
  time: string|0
}
const Row = (props: IRow) => {
  const { name, val1, val2, time } = props
  return <div className="row datarow flex flex-dir-row">
    <Col1>{name}</Col1>
    <Col2>{val1 ? val1 : 0}</Col2>
    <Col2>{val2 ? val2 : 0}</Col2>
    <Col2>{ time != 0 ? time : 0}</Col2>
  </div>
}

const _Metering = (props: { station?:IDBStation }) => {
  const { station } = props
  const stationViews = useSelectorTyped(state => state.stationsState)
  const stationView = station ? 
    stationViews.find(_station => _station.StationID == station.StationID) : undefined
  
  const stationViewRealTime = stationView && stationView.realTime.length > 0 ? stationView.realTime[0] : undefined
  const time = stationViewRealTime ? new Date(+stationViewRealTime.Time).toLocaleString().replace(/[AP]M/i,'')
                                    : 0
  const pevc1 = stationViewRealTime ? stationViewRealTime.Pevc : 0
  const pevc2 = stationViewRealTime ? stationViewRealTime.Pevc_02 : 0
  const tevc1 = stationViewRealTime ? stationViewRealTime.Tevc : 0
  const tevc2 = stationViewRealTime ? stationViewRealTime.Tevc_02 : 0
  const svf1 = stationViewRealTime ? stationViewRealTime.SVF : 0
  const svf2 = stationViewRealTime ? stationViewRealTime.SVF_02 : 0
  const gvf1 = stationViewRealTime ? stationViewRealTime.GVF : 0
  const gvf2 = stationViewRealTime ? stationViewRealTime.GVF_02 : 0
  const vb1_today = stationViewRealTime ? stationViewRealTime.VbToday : 0
  const vb2_today = stationViewRealTime ? stationViewRealTime.VbToday_02 : 0
  const vm1_today = stationViewRealTime ? stationViewRealTime.VmToday : 0
  const vm2_today = stationViewRealTime ? stationViewRealTime.VmToday_02 : 0
  const vb1_lastd = stationViewRealTime ? stationViewRealTime.VbLast : 0
  const vb2_lastd = stationViewRealTime ? stationViewRealTime.VbLast_02 : 0
  const vm1_lastd = stationViewRealTime ? stationViewRealTime.VmLast : 0
  const vm2_lastd = stationViewRealTime ? stationViewRealTime.VmLast_02 : 0
  // const gva1 = stationViewRealTime ? stationViewRealTime.va : 
  // const gva2 = stationViewRealTime ? stationViewRealTime.Pevc : 0
  // const sva = stationViewRealTime ? stationViewRealTime. : 0
  // const pevc1 = stationViewRealTime ? stationViewRealTime.Pevc : 0
  // const pevc1 = stationViewRealTime ? stationViewRealTime.Pevc : 0
  // const realtime = station.realTime[0]
  // const { Pevc=0, Tevc=0, GVF=0, SVF=0, VbToday=0, VmToday=0, VbLast=0, VmLast=0 } = realtime || {}
  return <div className="flex flex-dir-col innerflex cus metering mg40p">
    <Header station={station}/>
    <Row 
        time={time}
        name={`Static Pressure (${mapProToUnit("P")})`} 
        val1={pevc1.toFixed(4)} 
        val2={pevc2.toFixed(4)}/>
    <Row time={time}
        name={`Temperature (${mapProToUnit("T")})`} 
        val1={tevc1.toFixed(4)} 
        val2={tevc2.toFixed(4)}/>
    <Row 
        time={time}
        name={`Uncorrected Flowart (${mapProToUnit("GVF")})`} 
        val1={gvf1.toFixed(4)} 
        val2={gvf2.toFixed(4)}/>
    <Row 
        time={time}
        name={`Flowrate (${mapProToUnit("SVF")})`} 
        val1={svf1.toFixed(4)} 
        val2={svf2.toFixed(4)}/>
    <Row 
        time={time}
        name={`Engery Flowrate (${mapProToUnit("EneFlowRate")})`}/>
    <Row 
        time={time}
        name={`Today Uncorrect Flowrate (${mapProToUnit("GVA")})`} 
        val1={vm1_today.toFixed(4)} 
        val2={vm2_today.toFixed(4)}/>
    <Row 
        time={time}
        name={`Today Volume (${mapProToUnit("SVA")})`}
        val1={vb1_today.toFixed(4)} 
        val2={vb2_today.toFixed(4)}/>
    <Row 
        time={time}
        name={`Today Engery (${mapProToUnit("Energy")})`}/>
    <Row 
        time={time}
        name={`Yesterday's Standard Acc Volume (${mapProToUnit("SVA")})`} 
        val1={vb1_lastd.toFixed(4)}
        val2={vb2_lastd.toFixed(4)}/>
    <Row 
        time={time}
        name={`Yesterday's Uncorrect Volume (${mapProToUnit("GVA")})`} 
        val1={vm1_lastd.toFixed(4)}
        val2={vm2_lastd.toFixed(4)}/>
    <Row 
        time={time}
        name={`Yerterday Energy (${mapProToUnit("Energy")})`}/>
  </div>
}

export const Metering = React.memo( _Metering )