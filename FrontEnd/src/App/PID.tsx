import React from 'react'

export const _PID = () => {
  return <div className="innerflex ovfa">
    <div className="topo-outer pid">
      <img className="pid" src="/assets/image/PID.png" />
    </div>
  </div>
}

export const PID = React.memo( _PID )