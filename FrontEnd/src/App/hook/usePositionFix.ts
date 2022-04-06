import React from 'react'
import { OutsideClick } from './outsideClick'

type ExpandState = {
  isExpand: true, at: Omit<DOMRect, "toJSON">
} | {
  isExpand: false, at: undefined
}
export const usePositionFix = () => {

  const componRef = React.useRef<HTMLDivElement>(null)
  const listRef   = React.useRef<HTMLDivElement>(null)
  const buttonref = React.useRef<HTMLDivElement>(null)
  const slotref   = React.useRef<HTMLDivElement>(null)

  const [expand, setExpand] = React.useState<ExpandState>({ isExpand: false, at: undefined });
  
  const toggle = React.useCallback(() => {
    const buttondom = buttonref.current
    if(!buttondom) return
    const buttonRect  = buttondom.getBoundingClientRect()
    if(expand.isExpand){
      return setExpand({ isExpand: false, at: undefined })
    } else {
      setExpand({ isExpand: true, at: buttonRect })
    }
  }, [expand,listRef,buttonref,componRef,slotref])


  React.useLayoutEffect(() => {
    const compondom = componRef.current
    const listDom       = listRef.current
    const buttondom     = buttonref.current
    const slotdom   = slotref.current
    if(!expand || !listDom || !buttondom || !compondom || !slotdom) return
    
    const buttonRect   = buttondom.getBoundingClientRect();
    const listRect     = listDom.getBoundingClientRect();
    const documentRec  = document.body.getBoundingClientRect();
    
    if(expand.isExpand){
      slotdom.style.width = `${buttonRect.width}px`
      slotdom.style.height = `${buttonRect.height}px`
      compondom.style.top = `${expand.at.top}px`
      compondom.style.left = `${expand.at.left}px`
      compondom.style.marginTop = "0";
      compondom.style.marginLeft = "0";
      listDom.style.top = `${expand.at.top + buttonRect.height}px`;

      if((listRect.right + 10) >= documentRec.right){
        listDom.style.left = `${listRect.left-listRect.width+buttonRect.width}px`
      }
      
      if(listRect.bottom >= documentRec.bottom){
        listDom.style.top = `${listRect.top-listRect.height-buttonRect.height - 10}px`
      }
      // if(listRect.right+5 > documentRec.right){
      //   listDom.style.left = `${listRect.left-listRect.width+buttonRect.width}px`
      // }
      listDom.style.minWidth  = `${buttonRect.width}px`;
      listDom.style.width = "max-content"
      
    } else {
      slotdom.setAttribute('style', '')
      listDom.setAttribute('style', '')
      compondom.setAttribute('style', '')
      compondom.style.top =     'auto'
      compondom.style.left =    'auto'
    }

  }, [expand,listRef,slotref,buttonref,componRef])


  const clickDispose = () => 
    setExpand({ isExpand: false, at: undefined })

  OutsideClick(listRef, expand.isExpand, clickDispose )
  return { expand, componRef, toggle, clickDispose, listRef, buttonref, slotref }
}
