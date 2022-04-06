import React from 'react'
const parser = new DOMParser();
import { IDBGCDATA } from '../../../../Interface'


type PropName = "SVA" | "SVF" | "GVA" | "GVF" | "P" | "T" | "GD" | "Energy" | "Battery" | "EneFlowRate" | "ghv" | "Pout"


export const mapProToUnit = (prop: PropName) => {
  let character = ''
  switch(prop){
    case "GD":      { character = "%"; break; }
    case "SVA":     { character = "Sm&sup3;"; break }
    case "SVF":     { character = "Sm&sup3;/h"; break; }
    case "GVA":     { character = "m&sup3;"; break }
    case "GVF":     { character = "m&sup3;/h"; break; }
    case "P":       { character = "Bara"; break; }
    case "T":       { character = "&#8451;"; break }
    case "Energy":  { character = "mmBTU"; break; }
    case "Battery":  { character = "month"; break; }
    case "EneFlowRate": { character = "mmBTU/h"; break; }
    case "Pout":    { character = "Barg"; break; }
    case "ghv": { character = "MJ/Sm&sup3;"; break }
    default: character = "";
  }

  const decodeString = parser.parseFromString(`<span className="s_char">${character}</span>`, 'text/html').body.textContent;
  return decodeString
}

export const GCTOName: { [k in keyof Partial<IDBGCDATA>]: string } = {
  "Ethane": "Ethane (C2H6)",
  "Heat value": `Gross Heating Value`,
  "Methan": "Methan (CH4)",
  "Propane": "Propane (C3H8)",
  "carbondioxit": "Carbondioxit (C02)",
  "i-Butane": "i-Butane (i-C4H10)",
  "i-Pentane": "i-Pentane (i-C5H12)",
  "n-Pentane": "n-Pentane (n-C5H12)",
  "n-butane": "n-butane (n-C4H10)",
  "n-hexane": "n-hexane (n-C6H14)",
  "nitrogen": "Nitrogen (N2)",
  "relative": "Relative density",
}


export const GCUnit = (k: keyof IDBGCDATA) => {
  switch (k) {
    case "Heat value": return mapProToUnit("ghv")
    case "relative": return ""
    default: return "%"
  }
}

export function SmartPopup<T extends HTMLElement>(ref: React.RefObject<T>, eleIndex?:number) {
  // const [initState, setInitState] = React.useState<DOMRect|undefined>(undefined)
  const [render, setRender] = React.useState(false)
  const [dir, setDir] = React.useState<"left"|"right"|"bot"|"top"|"">("")
  function caculate(){
    const dom = ref.current
    if(dom){
      const docRect = document.body.getBoundingClientRect()
      dom.className = dom.className.replace(/left|right|bot|top/, '')
      dom.style.left = "100%"
      const guestRightRect = dom.getBoundingClientRect()
      dom.style.left = ""
      if(guestRightRect.right + 8 < docRect.right){
        setDir("right")
        return
      }
      dom.style.transform = "translate(calc(-100% - 8px), -50%)"
      const guestLeftRect = dom.getBoundingClientRect()
      dom.style.transform = ""
      if(guestLeftRect.left - 8 > docRect.left){
        setDir("left")
        return
      }
    }
  }

  React.useEffect(() => {
    let count = 1
    let loop = true
    while(!render && loop){
      count = count + 1
      if(count >= 100){
        loop = false
        return
      }
      const dom = ref.current
      if(dom) setRender(true)
    }
  }, [])

  React.useEffect(() => {
    if(!render || dir != '') return
    caculate()
  }, [render])

  React.useEffect(() => {
    const dom = ref.current
    if(dom){
      let oldClass = dom.className.split(" ")
      oldClass = oldClass.filter(e => e!="right" && e!="left" && e!="top" && e!="bot")
      dom.className = [...oldClass, dir].join(" ")
    }
  })

  React.useEffect(() =>  { 
    if(!render) return
    window.addEventListener("resize", caculate)
    return () => {
      window.removeEventListener("resize", caculate)
    }
  }, [render])
}