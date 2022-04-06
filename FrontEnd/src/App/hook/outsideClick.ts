import React from 'react'

export const OutsideClick = <T extends HTMLElement>(ref:React.RefObject<T>, isClicked:boolean, callback:() => void) => {
  const handleOutClick = (event: MouseEvent) => { 
    if(ref.current && !ref.current.contains(event.target as Node)){
      callback()
    }
  }
  
  React.useEffect(() => {
    if(isClicked){ 
      document.addEventListener("click", handleOutClick)
    }
    return () =>{
      document.removeEventListener('click', handleOutClick)
    }
  }, [isClicked])
}
