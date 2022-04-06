import React  from 'react'
import { IDBStation, IViewStation } from '../../../Interface'
import { useSelectorTyped } from '../reducers'
import { mapProToUnit } from './hook'
import { EStationID } from '../../../globalSettings'
import { CGraphic } from './Elements'
const _CPID = (props:{ station: IDBStation }) => {
  const sStation = useSelectorTyped( state => state.stationsState.find( s => s.StationID == props.station.StationID))!
  const stationcode = props.station.stationCode.toLowerCase()
  const [image_rect, set_image_rect] = React.useState<DOMRect|undefined>(undefined)
  const imageRef = React.useRef<HTMLImageElement>(null)

  function image_loaded(){
    const image = imageRef.current
    if(image){
      set_image_rect(image.getBoundingClientRect())
    }
  }

  return <div className={`innerflex posRel hei100 cus ovfa ${stationcode}`}>
  <div className={`topo-outer ${stationcode}`}>
    <div className="group-container" style={{ height: 180+(image_rect?image_rect.height:0) }}>
      <img ref={imageRef} onLoad={image_loaded} className={`${stationcode}`} src={`/assets/image/PID_${stationcode.toUpperCase()}.png`} alt="Topology not found"/>
      <FloatCPID station={sStation} />
    </div>
    <CGraphic station={sStation} />
  </div>

</div>
}


export const CPID = React.memo( _CPID )

const FloatCPID = (props: { station: IViewStation|undefined }) => {
  const { station } = props
  const realtime         = station ? station.realTime                  : []
  const connectionStatus = station ? station.connectionStatus          : []

  const StationID   = station ? station.StationID                      : 999999
  const sdvState    = realtime.length == 0 || realtime[0].SDV    == 1 ? "green" : "red"
  const hornState   = realtime.length == 0 || realtime[0].Horn   == 0 ? "green" : "blink"
  const beconState  = realtime.length == 0 || realtime[0].Becorn == 0 ? "green" : "blink"
  const gd1         = realtime.length > 0 ? realtime[0].GD1.toFixed(2)        : "0"
  const gd2         = realtime.length > 0 ? realtime[0].GD2.toFixed(2)        : "0"
  const gvf1        = realtime.length > 0 ? realtime[0].GVF.toFixed(2)        : "0"
  const svf1        = realtime.length > 0 ? realtime[0].SVF.toFixed(2)        : "0"
  const pev1        = realtime.length > 0 ? realtime[0].Pevc.toFixed(2)       : "0"
  const tev1        = realtime.length > 0 ? realtime[0].Tevc.toFixed(2)       : "0"

  const gvf2        = realtime.length > 0 ? realtime[0].GVF_02.toFixed(2)     : "0"
  const svf2        = realtime.length > 0 ? realtime[0].SVF_02.toFixed(2)     : "0"
  const pev2        = realtime.length > 0 ? realtime[0].Pevc_02.toFixed(2)    : "0"
  const tev2        = realtime.length > 0 ? realtime[0].Tevc_02.toFixed(2)    : "0"
  const pout        = realtime.length > 0 ? realtime[0].Pout.toFixed(2)       : "0"
    
  const cStatus     = connectionStatus.length > 0 && connectionStatus.reduce((a,b) => a.hIndex > b.hIndex ? a : b).Status == 1 
                      ? "connected" 
                      : "disconnected"
  const UPS         = !station || station.realTime.length == 0 ? "failed" 
                      :station.realTime[0].UPS == 1
                      ? "using" : station.realTime[0].UPS == 2 ? "charging" 
                        : station.realTime[0].UPS == 3 ? "failed" : "normal"
  return <> 
  {/* float block 1 */}
  <div className="float item item1 flex flex-dir-col row1 col2">
    <div className="flex flex-dir-row space-between">
      <span className="header">GVF:</span>
      <span className="value">{gvf1}</span>
      <span className="unit">{mapProToUnit("GVF")}</span>
    </div>
    <div className="flex flex-dir-row space-between">
      <span className="header">SVF:</span>
      <span className="value">{svf1}</span>
      <span className="unit">{mapProToUnit("SVF")}</span>
    </div>
    <div className="flex flex-dir-row space-between">
      <span className="header">P:</span>
      <span className="value">{pev1}</span>
      <span className="unit">{mapProToUnit("P")}</span>
    </div>
    <div className="flex flex-dir-row space-between">
      <span className="header">T:</span>
      <span className="value">{tev1}</span>
      <span className="unit">{mapProToUnit("T")}</span>
    </div>
  </div>
  {/* end float block 1 */}

  {[EStationID.kcc, EStationID.menchuen].indexOf(StationID) > -1 ? <div className="float item item2 flex flex-dir-col row3 col2">
    <div className="flex flex-dir-row space-between">
      <span className="header">GVF:</span>
      <span className="value">{gvf2}</span>
      <span className="unit">{mapProToUnit("GVF")}</span>
    </div>
    <div className="flex flex-dir-row space-between">
      <span className="header">SVF:</span>
      <span className="value">{svf2}</span>
      <span className="unit">{mapProToUnit("SVF")}</span>
    </div>
    <div className="flex flex-dir-row space-between">
      <span className="header">P:</span>
      <span className="value">{pev2}</span>
      <span className="unit">{mapProToUnit("P")}</span>
    </div>
    <div className="flex flex-dir-row space-between">
      <span className="header">T:</span>
      <span className="value">{tev2}</span>
      <span className="unit">{mapProToUnit("T")}</span>
    </div>
  </div> : undefined }

  {/* float block 3 */}
  <div className="float item pout flex flex-dir-col">
    <div className="flex flex-dir-row space-between">
      <span className="header">P:</span>
      <span className="value">{pout}</span>
      <span className="unit">{mapProToUnit("Pout")}</span>
    </div>
  </div>
  {/* end float block 3 */}

  <GasDetector gd1={gd1} gd2={gd2} beconState={beconState} hornState={hornState} />

  {/* start connect status */}
  <div className="float item item4 flex flex-dir-col corner right row1">
    <div className="flex flex-dir-row">
      <span className="header">Status:</span>
      <span className={`value text-capitalize ${cStatus} text`}>{cStatus}</span>
    </div>
    <div className="flex flex-dir-row">
      <span className="header">UPS:</span>
      <span className={`value text-capitalize ${UPS} text`}>{UPS}</span>
    </div>
  </div>
  {/* end connect status */}
  {/* float block 5 status of SDV */}
  <div className={`float middle-row sdv_status`}>
    <div className={`flex middle-row circle ${sdvState}`}>SDV {StationID}01</div>
  </div>
  {/* end block 5 */}
  </> 
} 

interface IGasDetector {
  gd1?:string, gd2?:string, hornState: "green" | "blink", beconState: "green" | "blink"
}

export const GasDetector = React.memo((props: IGasDetector) => {
  const { gd1, gd2, beconState, hornState } = props
  return (
    <div className="float item item4 flex flex-dir-col corner left row1">
      { gd1 ? <div className="flex flex-dir-row space-between">
        <span className="header">GD1:</span>
        <span className="value">{gd1}</span>
        <span className="unit">{mapProToUnit("GD")}</span>
      </div> : undefined }
      { gd2 ? <div className="flex flex-dir-row space-between">
        <span className="header">GD2:</span>
        <span className="value">{gd2}</span>
        <span className="unit">{mapProToUnit("GD")}</span>
      </div> : undefined }
      <div className="flex flex-dir-row space-around">
        <div className={`flex center circle ${hornState}`}>HR</div>
        <div className={`flex center circle ${beconState}`}>BC</div>
      </div>
    </div>
  )
})