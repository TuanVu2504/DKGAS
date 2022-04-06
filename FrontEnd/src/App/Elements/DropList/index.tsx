import React from 'react';
import { OutsideClick } from '../../hook';

interface IDropListSelectProps<T> {
  selected?: T,
  list: T[]
  showPro: keyof T,
  itemClick: (item: T) => void,
}

export function useAutoAlignList(listref: React.RefObject<HTMLUListElement>, drop: boolean){
  React.useLayoutEffect(() => {
    if(!listref || !listref.current) return
    const listComp = listref.current
    const list_position = listComp.getBoundingClientRect()
    const docu_position = document.body.getBoundingClientRect()
    if(drop && list_position.right > docu_position.right){
      listComp.style.right = "0px";
    } else if(!drop){
      listComp.style.right = "unset"
    }
  }, [drop])
}

export function DropListSelect<T>(props: IDropListSelectProps<T>) {
  const { list, itemClick, showPro, selected } = props
  const [drop,setDrop]                  = React.useState(false)
  const [_selected, select]             = React.useState(selected||list[0])
  const listref                         = React.useRef<HTMLUListElement>(null);

  OutsideClick(listref, drop, () => setDrop(false))
  useAutoAlignList(listref, drop)
  
  return <span className="posRel">
    <span className={`drop-btn hei40p middlerow pointer ${drop?'expand':''}`} onClick={() => setDrop(drop => !drop)}>
      { selected ? String(selected[showPro]).toUpperCase() : String(_selected[showPro]).toUpperCase() }
    </span>
    <ul ref={listref} className={`${drop ? 'show' : ''} drop-list`}>
      {list.map((item,index) => {
        const _selectedStyle = selected && selected[showPro] == item[showPro] ? ' selected' :
                               !selected && item[showPro] == _selected[showPro] ? " selected" : ''
        return <li 
                  key={index}>
                    <a 
                      className={_selectedStyle}
                      onClick={() => {
                        itemClick(item)
                        select(item)
                        setDrop(false)
                      }}>
                        {String(item[showPro]).toUpperCase()}
                    </a></li>
      })}
    </ul>
  </span>
}

interface IDropList<T> extends IDropListSelectProps<T>, IDropListItem<T> {
  children: string
}
interface IDropListItem<T> {
  active?:(list: T[]) => boolean,
  memberActiveCond?: (member: T) => boolean
}
export function DropList<T>(props: IDropList<T>) {
  const { list, itemClick, showPro, selected, children, active, memberActiveCond } = props
  const [drop,setDrop]                  = React.useState(false)
  const listref                         = React.useRef<HTMLUListElement>(null);
  const container_class = active != undefined && !active(list) ? 'disabled' : ''

  OutsideClick(listref, drop, () => setDrop(false))
  useAutoAlignList(listref, drop)

  return <span className="posRel">
    <span 
      className={`drop-btn hei40p middlerow pointer ${container_class} ${drop?'expand':''}`} 
      onClick={() => setDrop(drop => !drop)}>
      { children.toUpperCase() }
    </span>
    <ul ref={listref} className={`${drop ? 'show' : ''} drop-list`}>
      {list.map((item,index) => {
        const itemActive = memberActiveCond ? memberActiveCond(item) : true
        let list_item_class = !itemActive ? 'disabled' : ''
        return <li 
                  key={index}>
                    <a
                      className={list_item_class}
                      onClick={() => {
                        itemClick(item)
                        setDrop(false)
                      }}>
                        {String(item[showPro]).toUpperCase()}
                    </a></li>
      })}
    </ul>
  </span>
}