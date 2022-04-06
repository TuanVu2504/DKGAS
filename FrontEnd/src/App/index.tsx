import React from 'react'
import { NavLink, Switch, Route, Redirect, useHistory } from 'react-router-dom'
import { PFD } from './PFD'
import { PID } from './PID'
import { Outlet } from './Outlet'
import { BigHeader, SubMenu, OutLetPaging } from './BigHeader'
import '../assets/style.scss'
import { stationConfig } from '../../../globalSettings'
import { CPID } from './CPID'
import { CCauseEffect } from './CCauseEffect'
import { Metering } from './Metering'
import { Report } from './Report'
import { GCData } from './GCData'
import { MyModal } from './Modal'
import { useSocket } from './WebsocketHandler'
import LoginForm from './LoginForm'
import { useSelectorTyped } from '../reducers'
import { useDispatch } from 'react-redux'
import { api } from '../helpers'
import { IViewStation } from '../../../Interface'
import { LogInSuccess, LogOutRequest, AppDownloadStations } from '../actions'
import { PlayHornAudio, downloadGCData, useModal } from './hook'

const { lgdsnav } = stationConfig

const App = () => <>
  <MyModal />
  <Switch>
    <Route exact path="/login" component={ LoginForm } />
    <Route path="/" component={ MainRoute } />
  </Switch>
</>

const MainRoute = () => {
  const { BlockUserInteraction, close, apiError } = useModal()
  const history = useHistory()
  const { open } = useSelectorTyped( state => state.modal )
  const { name, authenticated } = useSelectorTyped(state => state.authentication)
  const dispatch = useDispatch()
  React.useEffect(() => {
    BlockUserInteraction("Checking authentication", "Authentication")
    fetch('http://scada.dkgas.com.vn/verifycookie', { method: "GET" })
    .then(async res => { 
      if(!res.ok){
        history.push('/login')
        return dispatch(LogOutRequest())
      }
      const user = await res.json();
      dispatch(LogInSuccess({ "authenticated": true, loggingIn: false, "name": user.name }))
      
      BlockUserInteraction("Initialize app", "Initializing")
      return api<IViewStation[]>('http://scada.dkgas.com.vn/api/stations?latest=true')
        .then(res => dispatch(AppDownloadStations(res)))
        .then(() => history.push('/'))
    })
    .then(close)
    .catch(apiError)
  }, [])

  return authenticated ? <div className={`flex flex-dir-col hei100v ${open?'blur':''}`}>
    <PageHeading name={name} />
    <AuthenticatedContent />
  </div>  
  : <div>loading</div>
}
const PageHeading = React.memo((props: { name: string }) => {
  const { name } = props
  const dispatch = useDispatch()
  const history = useHistory()
  const logout = React.useCallback(() => { 
    fetch('http://scada.dkgas.com.vn/logout')
    .then(() => dispatch(LogOutRequest()))
    .finally(() => history.push('/login'))
  }, [])

  return <>
    {/* heading */}
    <div className="heading flex flex-dir-row space-between">
    <div className="flex flex-dir-row">
      <div className="logo-img"></div>
      <div className="logo-font">LGDS DKENT</div>
    </div>
    
    <div className="flex flex-dir-row user">
      <div className="dispayname">{name}</div>
      <div className="pointer" onClick={logout}>logout</div>
    </div>
  </div>
  {/* End heading */}
  </>
})

const LeftMenu = React.memo(() => {
  PlayHornAudio()
  useSocket()
  const stations = useSelectorTyped( state => state.stationsState )
  return (
    <div className="flex flex-dir-col nav">
      <div className="title">LGDS</div>
      <ul>
      {
        lgdsnav.map(sub => 
          <li key={sub.short}>
            <NavLink to={{ pathname: `/${sub.short}`}}>
              {sub.long}
            </NavLink>
          </li>
        )
      }
      </ul>
      <div className="title">customer</div>
      <ul>
      {
        stations.map((station) => {
          // const stationState = useSelectorTyped( state => state.stationsState.find(s => s.StationID == station.StationID))
          const beconState = station.realTime.length > 0 ? station.realTime[0].Becorn : 0
          return <li key={station.stationCode}>
            <NavLink 
              className={`${beconState == 1 ? "blink" : ''}`} 
              activeClassName="active" 
              to={{ pathname: `/${station.stationCode}`}}>
                {station.name}
            </NavLink>
          </li>
        })
      }
      </ul>
      <div className="title">Report</div>
      <ul>
        <li><NavLink activeClassName="active" to={{ pathname: `/report`}}>Report</NavLink></li>
      </ul>
    </div>
  )
})

const AuthenticatedContent = React.memo(() => {
  // DownloadStationData()
  const { dateSelected, setDay } = downloadGCData()
  return <div className="flex flex-dir-row flex1 innerflex">
    <LeftMenu />
    <div className="flex flex1 innerflex content flex-dir-col">
      <Switch>
        <Route exact path={`/:subpath(pfd|p_id|metering|gcdata)`} component={ BigHeader } />
        <Route path={`/:subpath(${stationConfig.stations.map(s => s.stationCode).join(`|`)})`} component={ SubMenu } />
        <Route path={`/outlet`} component={ OutLetPaging } />
      </Switch>
      <Switch>
        <Route exact path={`/`} render={(props) => 
          <Redirect to={{
            pathname: `/pfd`,
            state: { from : props.location }
          }}/>
        }/>
        <Route exact path={`/outlet`} render={(props) => 
          <Redirect to={{
            pathname: `${props.match.url}/page1`,
            state: { from : props.location }
          }}/>
        }/>
        <Route exact path={`/:subpath(${stationConfig.stations.map(s => s.stationCode).join(`|`)})`} render={(props) => {
          return <Redirect to={{
            pathname: `${props.match.url}/p_id`,
            state: { from : props.location }
          }}/>
        }}/>

        <Route path={`/report`}>
          <Report />
        </Route>
        
        <Route path={`/pfd`}>
          <PFD />
        </Route>

        <Route path={`/p_id`}>
          <PID />
        </Route>

        <Route path={`/outlet`}>
          <Switch>
            <Route exact path={`/outlet/page1`} render={() => <Outlet page={1}/> } />
            <Route exact path={`/outlet/page2`} render={() => <Outlet page={2}/> } />
          </Switch>
        </Route>

        <Route path={`/metering`}>
          <Metering />
        </Route>

        <Route path={`/gcdata`}>
          <GCData dateSelected={dateSelected} setDay={setDay} />
        </Route>
        {/* ENd Route path for LGDS */}

        <Route path={`/:subpath/:submenu`} render={(props) => {
          const { submenu, subpath } = props.match.params
          const station = stationConfig.stations.find(child => child.stationCode == subpath)
          // stationConfig.stations.find(stationcfg => stationcfg.stationCode == subpath)
          
          if(!station) return
          return submenu == "p_id"  ? <CPID station={station} /> :
          submenu == "mertering"  ? <Metering station={station} /> :
          submenu == "causeeffect" ? <CCauseEffect station={station}/>
          : undefined
        }}/>
      </Switch>
    </div>
  </div>
})


export default App