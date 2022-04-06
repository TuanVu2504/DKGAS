import React from 'react'
import { IViewStation } from '../../../Interface'
import { useSelectorTyped } from '../reducers'
import { mapProToUnit, useModal } from './hook'
import * as datefns from 'date-fns'

const _Outlet = (props: { page: number }) => {
  const { page } = props
  const stations = useSelectorTyped( state => state.stationsState ).slice((page - 1)*6, page * 6)
  return <div className="flex flex-dir-col innerflex flex1 outlet">
    <div className="stations flex1 flex flex-dir-row">
    {
      stations.map( station => <StationPanel 
        key={station.StationID} 
        station={station} 
      />)
    }
    </div>
  </div>
}

export const StationPanel =  (props: { station: IViewStation }) => {
  const { station } = props
  const StationType = station.type
  const StationID = station.StationID
  const { confirm  } = useModal()
  const LineID = station.LineID
  const line2Style = "value val2" + (station.lines.length == 1 ? ' disabled' : '')
  const stationConnectionStatus = station.connectionStatus
  const latestStatus            = stationConnectionStatus.length > 0 ? stationConnectionStatus.reduce((a,b) => a.hIndex > b.hIndex ? a : b).Status : 0
  const stationRealTime         = station.realTime
  const latestRealTime          = stationRealTime.length > 0 ? stationRealTime[0] : undefined
  const currentUpdateTime       = latestRealTime ? datefns.format(+latestRealTime.Time, 'yyyy/MM/dd HH:mm:ss')
                                                 : "unknown"
  const UPS = latestRealTime ? latestRealTime.UPS : 0

  const lineSelect = (lineID: number) => {
    confirm(
      [`Are you sure ${station.name.toUpperCase()} will use ${StationType}-${StationID}0${lineID}?`],
      () => fetch(`http://scada.dkgas.com.vn/api/duty?StationID=${station.StationID}&LineID=${lineID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      })
    )
  }

  return <div className={`outer ${ latestStatus == 0? 'disconnected': '' }`}>
    <div className="flex flex-dir-row">
      <div className="flex1 flex station-name pd-l-14p rowstart">{station.name}</div>
      <div className="flex1 flex rowend pd-r-24p op-5">{currentUpdateTime}</div>
    </div>
    <div className="list">
      <div className="header">
        <div>
        </div>
        <div onClick={ () => lineSelect(1) } className={`pointer value val1 ${LineID && LineID == 1 ? 'active': ''}`}>
        {`${station ? `${station.type}-${station.StationID}` : 'unknown' }01`}
        </div>
        <div onClick={ () => lineSelect(2) }  className={`pointer ${line2Style} ${LineID && LineID == 2 ? 'active': ''}`}>
        {`${station ? `${station.type}-${station.StationID}` : 'unknown' }02`}
        </div>
      </div>
      <div className="info">
        <div>
          Inlet Pressure ({mapProToUnit("P")})
        </div>
        <div className="value val1">
        { latestRealTime ? latestRealTime.Pevc.toFixed(2) : 0 }
        </div>
        <div className={line2Style}>
        { latestRealTime ? latestRealTime.Pevc_02.toFixed(2) : 0 }
        </div>
      </div>
      <div className="info">
        <div>
          Temperature ({mapProToUnit("T")})
        </div>
        <div className="value val1">
        { latestRealTime ? latestRealTime.Tevc.toFixed(2) : 0 }
        </div>
        <div className={line2Style}>
        { latestRealTime ? latestRealTime.Tevc_02.toFixed(2) : 0 }
        </div>
      </div>
      <div className="info">
        <div className="posRel">
          SVA ({mapProToUnit("SVA")})
          {/* SVA (Sm<span className="s_char">&sup3;</span>) */}
        </div>
        <div className="value val1">
        { latestRealTime ? latestRealTime.Vb.toFixed(2) : 0 }
        </div>
        <div className={line2Style}>
        { latestRealTime ? latestRealTime.Vb_02.toFixed(2) : 0 }
        </div>
      </div>
      <div className="info">
        <div>
          SVF ({mapProToUnit("SVF")})
        </div>
        <div className="value val1">
        { latestRealTime ? latestRealTime.SVF.toFixed(2) : 0 }
        </div>
        <div className={line2Style}>
        { latestRealTime ? latestRealTime.SVF_02.toFixed(2) : 0 }
        </div>
      </div>
      <div className="info">
        <div>
          GVA ({mapProToUnit("GVA")})
        </div>
        <div className="value val1">
        { latestRealTime ? latestRealTime.Vm.toFixed(2) : 0 }
        </div>
        <div className={line2Style}>
        { latestRealTime ? latestRealTime.Vm_02.toFixed(2) : 0 }
        </div>
      </div>
      <div className="info">
        <div>
          GVF ({mapProToUnit("GVF")})
        </div>
        <div className="value val1">
        { latestRealTime ? latestRealTime.GVF.toFixed(2) : 0 }
        </div>
        <div className={line2Style}>
        { latestRealTime ? latestRealTime.GVF_02.toFixed(2) : 0 }
        </div>
      </div>
      <div className="info">
        <div>
          Gas Detector ({mapProToUnit("GD")})
        </div>
        <div className="value val1">
        { latestRealTime ? latestRealTime.GD1.toFixed(2) : 0 }
        </div>
        <div className={line2Style}>
        { latestRealTime ? latestRealTime.GD2.toFixed(2) : 0 }
        </div>
      </div>
      <div className="info">
        <div>
          Battery ({mapProToUnit("Battery")})
        </div>
        <div className="value val1">
        { latestRealTime ? latestRealTime.Battery.toFixed(2) : 0 }
        </div>
        <div className={line2Style}>
        { latestRealTime ? latestRealTime.Battery.toFixed(2) : 0 }
        </div>
      </div>
      <div className="info">
        <div>
          Outlet Pressure ({mapProToUnit("Pout")})
        </div>
        <div className="value val1">
        { latestRealTime ? latestRealTime.Pout.toFixed(2) : 0 }
        </div>
      </div>
      <div className="info">
        <div>
          UPS Mode
        </div>
        <div className={`value val1 text ${UPS == 1 ? 'using' : UPS  == 2 ? 'charging' : UPS == 3 ? 'disconnected' : UPS == 4 ? 'normal' : ''}`}>
        { UPS == 1 ? "Using battery"
          : UPS == 2 ? "Charging"
          : UPS == 3 ? "Failed"
          : UPS == 4 ? "Normal" : 0 } 
        </div>
      </div>
    </div>
  </div>
}

export const Outlet = React.memo( _Outlet )