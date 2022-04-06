import React from 'react'
import  { useSelectorTyped } from '../../reducers'
const audio = new Audio('http://scada.dkgas.com.vn/assets/audios/stationHorn.mp3')
audio.loop = true

export const PlayHornAudio = () => {
  const stations = useSelectorTyped( state => state.stationsState )
  const [isPlayingHorn,setPlayHorn] = React.useState(false)
  const willPlay = stations.some( station => {
    const hornstate = station.realTime[0] ? station.realTime[0].Horn : 0
    return hornstate == 1
  })

  React.useEffect(() => {
    if(!audio) return
    
    if(!willPlay){
      if(isPlayingHorn){
        audio.pause()
        setPlayHorn(false)
      }
      return
    }

    if(!isPlayingHorn){
      audio.play()
      setPlayHorn(true)
    }
    // return () => setPlayHorn(false)
  }, [willPlay, isPlayingHorn, audio])
}
