import React from 'react'
import { ToolTip } from '../Elements/ToolTip'
import { useModal, OutsideClick, SmartPopup } from '../hook'
import * as datefns from 'date-fns'

interface IInLineListProps<T> {
  list: T[],
  children:(prop: T) => JSX.Element
}


function _InLineList<T>(props: IInLineListProps<T>){
  const { list, children } = props
  return <>
    {list.map(children)}
  </>
  
}

interface IInlineValue {
  header: string,
  value: string|number,
  valueStatus: string,
  onClick?:() => void
}
export function InlineValue(props: IInlineValue){
  const { header, value, onClick, valueStatus } = props
  return (
    <div className="pointer" onClick={onClick}>
      <div className="header">{header}</div>
      <div className={`status ${valueStatus}`}>{valueStatus}</div>
    </div>
  )
}

interface IInlineWithUpdaterProps<T,K extends keyof T> {
  object: T|undefined,
  prop: K,
  validate?: (val: string) => boolean,
  onConfirmUpdate: (object: Partial<T> & { [k in K]: string }) => Promise<void>
  onDelete: (object: T) => Promise<void>
}
export function InlineWithUpdater<T, K extends keyof T>(props: IInlineWithUpdaterProps<T, K>){
  const { object, prop, validate, onConfirmUpdate, onDelete } = props
  const [popup, setShowPopup] = React.useState(false)
  const [temp, setTemp] = React.useState({ [prop]: "" })
  const tempValue = temp[prop as keyof typeof temp]
  const valid = validate && popup ? validate(temp[prop as keyof typeof temp]) : true
  const ref = React.useRef<HTMLDivElement>(null)
  const { warn, BlockUserInteraction, apiError } = useModal()
  OutsideClick(ref, popup, close )
  SmartPopup(ref)

  const status  = object ? 'ok' : 'none'
  const value   = object ? object[prop] : undefined

  function close(){
    setTemp(_temp => ({ ..._temp, [prop]: '' }))
    setShowPopup(false)
  }

  function click(){
    if(!popup){
      setTemp(_temp => ({ ..._temp, [prop]: object ? object[prop] + "" : '' }))
      setShowPopup(true)
    } else close()
  }

  const tempManualOnChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const value = e.target.value;
    setTemp(_temp => ({ ..._temp, [prop]: value }))
  }

  async function saveUpdateManual(){
    if(!popup) return
    if(!valid) return warn("The input does not valid")
    BlockUserInteraction("Updating ..", "Update")
    onConfirmUpdate(Object.assign(object||{}, temp) as Partial<T> & { [k in K]: T[K]})
    .then(() => warn("Update dispatched successfully."))
    .catch(apiError)
  }

  async function deleteManual(){
    if(!popup) return
    if(object == undefined ) return
    onDelete(object).then(() => warn("Delete dispatched successfully"))
    .catch(apiError)
  }

  return (
    <div className={`pointer tool-tip-wrapper ${popup ? 'clicked': ''}`}>
      <div className="pointer" onClick={click}>
        <div className="header">Manual</div>
        <div className={`status ${status}`}>
          {value != undefined ? typeof value == "number" ? value.toFixed(4) : value + ""  : 'none'}
        </div>
      </div>
      <div ref={ref} className={`tool-tip-message popup-input ${valid?'':'invalid'}`}>
        {
          popup 
            ? <div className="wid100 hei100 flex flex-dir-col">
                <input value={tempValue == "0" && value ? typeof value == "number" ? value.toFixed(4) : value + "" : tempValue } onChange={ tempManualOnChange }/>
                <div className="btn pd-5p" onClick={ saveUpdateManual }>Save</div>
              </div>
            : ( 
              <div className="wid100 hei100 flex flex-dir-col">
                <div className="flex innerflex flex1 center">{value ? value : 'none'}</div>
                <div className={`btn pd-5p ${object?'':'disabled'}`} onClick={ deleteManual }>Delete</div>
              </div>
            )
        }
      </div>
    </div>
  ) 
}

interface IInLineValueWithToolTip<T> {
  value?: string | number, header: string,
  toolTip?: {
    list: T[],
    props: (keyof T)[]
  }
}
export function InlineValueWithToolTip<T>(props: IInLineValueWithToolTip<T>){
  const { value, header, toolTip } = props
  return <div>
    <div className="header">{header}</div>
    <div className={`status`}>
      { value != undefined && value != "???" ? <ToolTip toolTip={toolTip}>{ typeof value == "number" ? value.toFixed(4) : value+"" }</ToolTip> : '???' }
    </div>
  </div>
}

export const InLineList = React.memo( _InLineList ) as typeof _InLineList

interface IInlineDayCell {
  className?: string,
  description?:string
  children: React.ReactElement[]
  date: Date|number,
  format?: string,
  isDisabled?: () => boolean
}
export const InlineDayCellOuter = (props: IInlineDayCell) => {
  const { date, format, children, isDisabled, className, description } = props
  const _class = className ? className : ''
  const idDisabled = isDisabled ? isDisabled() : false
  return <div className={`cell ${_class} ${!idDisabled ? '':'disabled'}`}>
  <div className="day-capital">{ datefns.format(date, format || "dd") }</div>
  { description ? <div className="description">{description}</div> : undefined }
  <div className="note">
    { children }
  </div>
</div>
}