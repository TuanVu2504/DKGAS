import React from 'react';
import * as datefns from 'date-fns';
import { usePositionFix } from '../../hook'
import { IDropCalendar } from '../../../../../Interface'

const _DropCalendar = (props: IDropCalendar) => {
  const { expand, componRef, listRef, toggle, buttonref, slotref } = usePositionFix()
  const today = new Date().getTime()
  const { onClick, dateSelected=today, highlight, children, requireConfirm, onMonthChange } = props
  const [delayDispatch, setDelayDispatch] = React.useState<(() => any)|undefined>()
  const [tempSelectDay, _setSelectDate] = React.useState<number|undefined>()
  const [currentMonth, setCurrentMonth] = React.useState( dateSelected ? new Date(dateSelected) : new Date());
  const [confirm, setConfirm] = React.useState(false)

  let className =  'droplist flex flex-dir-col'
  className += props.className ? ` ${props.className}` : ''
  className += expand.isExpand ? ' expand' : ''
  // const style = expand.at ? { top: `${expand.at.top}px`} : undefined

  let btnClassName = 'droplist-btn wid100p pd5p'
  if(props.btnClassName) btnClassName = `${btnClassName} ${props.btnClassName}`

  const onYearChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    if(!(/[0-9]+/.test(value))) return
    setCurrentMonth(date => datefns.setYear(date, parseInt(value, 10)));
  }

  // const onMonthChange = (e:React.ChangeEvent<HTMLInputElement>) => {
  //   const { value } = e.target
  //   if(!(/[0-9]{1,2}/.test(value)) || parseInt(value, 10) > 12 || parseInt(value, 10) < 1) return
  //   setCurrentMonth(date => dateFns.setMonth(date, parseInt(value, 10) - 1))
  // }

  React.useEffect(() => {
    if(!requireConfirm && tempSelectDay){
      onClick(tempSelectDay)
      _setSelectDate(undefined)
      return
    }

    if(requireConfirm && confirm && tempSelectDay){
      onClick(tempSelectDay)
      _setSelectDate(undefined)
      return
    }
  }, [requireConfirm, onClick, tempSelectDay, confirm])

  const renderHeader = () => {
    return (
      <div className="header">
        <div className="col-1" onClick={ prevMonth }>
          <div className="icon left" >
            <i className="fa fa-chevron-left pointer" />
          </div>
        </div>
        <div className="col-2">
          <span>{ datefns.format(currentMonth, 'MMM') }</span>
          <span>{ currentMonth.getFullYear() }</span>
          {/* <input 
            onChange={ onMonthChange }
            value={ dateFns.format(currentMonth, 'MMM') } />
          <input 
            onChange={ onYearChange }
            value={ currentMonth.getFullYear() } /> */}
        </div>
        <div className="col-3" onClick={ nextMonth }>
          <div className="icon right">
            <i className="fa fa-chevron-right pointer" />
          </div>
        </div>
      </div>
    );
  }
    
  const renderDays = () => {
    const dateFormat = "eee";
    const days = [];

    let startDate = datefns.startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="cell days" key={i}>
          {datefns.format(datefns.addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="row">{days}</div>;
  }

  const renderCells = () => {
    const monthStart = datefns.startOfMonth(currentMonth);
    const monthEnd = datefns.endOfMonth(monthStart);
    const startDate = datefns.startOfWeek(monthStart);
    const endDate = datefns.endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];

    let days = [];
    let day = startDate
    let formattedDate = "";



    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        formattedDate = datefns.format(cloneDay, dateFormat);
        days.push(
          <div
            className={`cell date ${
              !datefns.isSameMonth(cloneDay, monthStart)
                ? 'disabled'
                : tempSelectDay && datefns.isSameDay(tempSelectDay, cloneDay) ? 'bg-blue-dark'
                : dateSelected && datefns.isSameDay(dateSelected, cloneDay)
                  ? 'selected' 
                  : datefns.isSameDay(cloneDay, today) ? 'today' : 
                  highlight && highlight.some( h => datefns.isSameDay(h.date, cloneDay)) ? 'highlight'
                  : ""
              }`}
              key={cloneDay.toString()}
              onClick={() => tempSelectDay && tempSelectDay == cloneDay.getTime() ? _setSelectDate(undefined) : _setSelectDate(cloneDay.getTime())}
          >
            <span>{formattedDate}</span>
          </div>
        );
        day = datefns.addDays(day, 1);
      }
      rows.push(
        <div className="row" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="body">
      {rows}
    </div>;
  }

  const nextMonth = () => { 
    setCurrentMonth(month => { 
      const nexmonth = datefns.addMonths(month, 1)
      if(onMonthChange) onMonthChange(datefns.startOfMonth(nexmonth))
      return nexmonth
    })
  };
  const prevMonth = () => { 
    setCurrentMonth(month => { 
      const premonth = datefns.subMonths(month, 1) 
      if(onMonthChange) onMonthChange(datefns.startOfMonth(premonth))
      return premonth
    })
  };

  return <>
    <div
    ref={componRef} 
    className={className}>
      <div 
        ref={buttonref}
        onClick={ toggle } 
        className={btnClassName}
      >
        { children ? children : datefns.format(dateSelected, 'yyyy/MM/dd')}
      </div>
    <div 
      ref={listRef}
      className="calendar toggle fade-in bg0 pd_bot10p">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
        {
          requireConfirm ?  <div 
                              className={`mg-bot5p mg_rig5p wid50p inlineblock txt-right align-self-end pointer ${tempSelectDay?'':'disabled'}`}
                              onClick={() => { 
                                setConfirm(true)
                              }}
                            >OK</div>
          : undefined
        }
    </div>
  </div>
  <div ref={slotref} className="slot"></div>
</>
}


export const DropCalendar = React.memo( _DropCalendar )