import React from 'react'
import { api } from '../../helpers'

type useAPIOptions<T> = (callbackParams: { data: T, err: null }|{ data: null, err: any }) => void;
export function useAPI<T>(url: string, callback?:useAPIOptions<T>){
  const [state, setState] = React.useState<T>()
  const [loading, setLoading] = React.useState(false)
  const [err, setError] = React.useState<any>()

  React.useEffect(() => {
    setError(undefined)
    setLoading(true)
    let mount = true
    api<T>(url)
    .then(result => {
      if(!mount) return
      setState(result)
      if(callback){
        callback({ data: result, err: null })
      }
    })
    .catch(err => {
      if(!mount) return
      setError(err)
      if(callback){
        callback({ data: null, err })
      }
    })
    .finally(() => { 
      if(!mount) return
      setLoading(false)
    })
    return () => { mount = false }
  }, [url])
  return {
    result:state,
    loading,
    err,
  }
}