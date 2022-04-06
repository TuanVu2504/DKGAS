import React from 'react'
import { useHistory } from 'react-router'
import { LogInRequest, LogInSuccess, LogOutRequest } from '../actions'
import { useDispatch } from 'react-redux'
import { IDBUser } from '../../../Interface'


const LoginForm = () => {
  const history = useHistory()
  const [username,setU] = React.useState('')
  const [password,setP] = React.useState('')
  const dispatch = useDispatch()
  const setUserName = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => { 
    const text = e.target.value
    setU(text)
  }, [])

  const setPassword = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => { 
    const text = e.target.value
    setP(text)
  }, [])

  const login = React.useCallback(() => {
    if(username == '' || password == '') return
    dispatch(LogInRequest())
    fetch('http://scada.dkgas.com.vn/authentication', { 
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username,password })
    })
    .then(async res => {
      if(!res.ok) { 
        const response = await res.json()
        dispatch(LogOutRequest())
        alert(response.message)
        return
      }
      const user = await res.json() as IDBUser
      dispatch(LogInSuccess({ "authenticated": true, loggingIn: false, "name": user.name }))
      history.push('/');
    })
  }, [username,password])

  return <div className="login-form flex flex-dir-row">
    <div className="logo-ctn"><div className="logo-img"></div></div>
    <div className="body">
      <div className="header">Login</div>
      <div className="username flex flex-dir-row"><div>USERNAME</div><input required type="text" onChange={setUserName} placeholder="Your username"/></div>
      <div className="password flex flex-dir-row"><div>PASSWORD</div><input required type="password" onChange={setPassword} placeholder="Your password"/></div>
      <div className="footer flex rowend">
        <div onClick={ login } className="button">Login</div>
      </div>
    </div>
  </div>
}

export default LoginForm