import React from 'react'
interface ILoaderProps {
  size: "xs"|"sm"|"m"|"lg",
  className?:string
}
export const MSLoader = React.memo((props:ILoaderProps) => {
  const { size } = props
  let className = `ms-loader-outer ${size}`
  if(props.className) className += ` ${props.className}`
  return <div className={className}>
  <div className='ms-loader'></div>
  <div className='ms-loader'></div>
  <div className='ms-loader'></div>
  <div className='ms-loader'></div>
  <div className='ms-loader'></div>
</div>
})