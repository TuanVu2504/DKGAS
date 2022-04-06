import React from 'react'
import { SmartPopup } from '../../hook'


interface IToolTipProps<T> {
  children: string,
  // dir?: "left" | "top" | "right" | "bottom"
  toolTip?:  { 
    list: T[],
    props: (keyof T)[]
  }
}

type RequiredToolTip<T> = IToolTipProps<T> & { toolTip: { list: T[], props: (keyof T)[] } }

function _ToolTip<T>(props: IToolTipProps<T>) {
  const { children, toolTip } = props
  const ref = React.useRef<HTMLDivElement>(null)
  SmartPopup(ref)
  return <div className='tool-tip-wrapper'>
    { children }
    <div ref={ref} className={`tool-tip-message`}>
      { toolTip && toolTip.list.length > 0 ? <ToolTipTable toolTip={toolTip} {...props} />  : children }
    </div>
  </div>
}

function ToolTipTable<T>(props: RequiredToolTip<T> ) {
  const { toolTip } = props
  const [headerWidth, setHeaderWith] = React.useState(toolTip.props.map(() => 0));
  const refs = React.useRef(toolTip.props.map(() => React.createRef<HTMLDivElement>()))  
  React.useEffect(() => {
    const widths = refs.current.map(ref => ref.current!.getBoundingClientRect().width)
    setHeaderWith(widths)
  }, [])

  return (
    <>
      <div className="flex flex-dir-row">
      { toolTip.props.map((_k, i) => <div key={i} ref={refs.current[i]} className="inl-block mg-r-5p">{_k}</div>) }
      </div>
      {
        toolTip.list.map((d,i) => {
          return <div className="flex flex-dir-row" key={i}>
          {
            toolTip.props.map((_key,i) => 
              <div key={i} style={{ width: `${headerWidth[i]}px`}} className="inl-block mg-r-5p">{d[_key]}</div>
            )
          }
          </div>
        })
      }
    </>
  )
}

export const ToolTip  = React.memo( _ToolTip ) as typeof _ToolTip
