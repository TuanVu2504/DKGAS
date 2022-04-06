import React from 'react'
import { IDBStation } from '../../../Interface'


const _CCauseEffect = (props:{ station : IDBStation }) => {
  
  const stationCode = props.station.stationCode.toLowerCase()

  return <div className={`flex middle-col innerflex ovfa posRel hei100 cus ${stationCode}`}>
  <div className={`causeeffect ${stationCode} innerflex flex`}>
    <img className={`innerflex ${stationCode.toLowerCase()}`} src={`/assets/image/CAUSEANDEFFECT_${stationCode.toUpperCase()}.png`} alt="Topology not found"/>
  </div>

</div>
}

export const CCauseEffect = React.memo( _CCauseEffect )