import React from 'react'
import { NavLink, useRouteMatch, useParams } from 'react-router-dom'

const _BigHeader = () => {
  const { subpath } = useParams<{subpath: string}>()
  return <div className="full-tile">
    <div className="flex1"></div>
    <div className="flex1 text">
    {
      subpath == "pfd" ? "PROCESS FLOW DIAGRAM" :
      subpath == "p_id" ? "PIPING AND INSTRUMENTATION DIAGRAM" :
      subpath == "metering" ? "MERTERING" :
      subpath == "gcdata" ? "GC Data" :
      "unknown"
    }
    </div>
    <div className="flex1"></div>
  </div>
}

const _SubMenu = () => {
  const match = useRouteMatch()
  return <div className="flex flex-dir-row cus-sub-menu">
    <NavLink activeClassName="active" to={{ pathname: `${match.url}/p_id` }}>p&id</NavLink>
    <NavLink activeClassName="active" to={{ pathname: `${match.url}/mertering` }}>metering system</NavLink>
    <NavLink activeClassName="active" to={{ pathname: `${match.url}/causeeffect` }}>cause and effect</NavLink>
  </div>
}

const _OutLetPaging = () =>{
  const match = useRouteMatch()
  return <div className="flex flex-dir-row cus-sub-menu">
    <NavLink activeClassName="active" to={{ pathname: `${match.url}/page1` }}>Page1</NavLink>
    <NavLink activeClassName="active" to={{ pathname: `${match.url}/page2` }}>Page2</NavLink>
  </div>
}


export const OutLetPaging = React.memo( _OutLetPaging )
export const SubMenu = React.memo( _SubMenu )
export const BigHeader = React.memo( _BigHeader )