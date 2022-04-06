import React from 'react'
import { useSelectorTyped } from '../reducers'
import { mapProToUnit} from './hook'
const _PFD = () => {
  const saitex = useSelectorTyped(state => state.stationsState).find(station => station.StationID == 67)!

  const menchuen = useSelectorTyped(state => state.stationsState).find(station => station.StationID == 70)!
  const kcc = useSelectorTyped(state => state.stationsState).find(station => station.StationID == 71)!
  const seah = useSelectorTyped(state => state.stationsState).find(station => station.StationID == 61)!
  const sinoma = useSelectorTyped(state => state.stationsState).find(station => station.StationID == 62)!
  const noxasean = useSelectorTyped(state => state.stationsState).find(station => station.StationID == 72)!


  return <div className="innerflex ovfa">
    <div className="topo-outer pfd">

      {/* KCC */}
      <div className="float i2 pfd kcc text">{kcc && kcc.realTime.length > 0 ? kcc.realTime[0].SVF.toFixed(2) : "000.00"} {mapProToUnit("SVF")}</div>
      <div className="float i3 pfd kcc text">{kcc && kcc.realTime.length > 0 ? kcc.realTime[0].GVF.toFixed(2) : "000.00"} {mapProToUnit("GVF")}</div>

      {/* Menchuyen */}
      <div className="float i2 pfd menchuen text">{ menchuen.realTime.length > 0 ? menchuen.realTime[0].SVF.toFixed(2) : "000.00"} {mapProToUnit("SVF")}</div>
      <div className="float i3 pfd menchuen text">{ menchuen.realTime.length > 0 ? menchuen.realTime[0].GVF.toFixed(2) : "000.00"} {mapProToUnit("GVF")}</div>

      {/* NOXASEAN */}
      <div className="float i2 pfd nox text">{ noxasean.realTime.length > 0 ? noxasean.realTime[0].SVF.toFixed(2) : "000.00"} {mapProToUnit("SVF")}</div>
      <div className="float i3 pfd nox text">{ noxasean.realTime.length > 0 ? noxasean.realTime[0].GVF.toFixed(2) : "000.00"} {mapProToUnit("GVF")}</div>

      {/* SAMYANG */}
      <div className="float i2 pfd samyang text">000.00 {mapProToUnit("SVF")}</div>
      <div className="float i3 pfd samyang text">000.00 {mapProToUnit("GVF")}</div>

      {/* LICHENG */}
      <div className="float i2 pfd licheng text">000.00 {mapProToUnit("SVF")}</div>
      <div className="float i3 pfd licheng text">000.00 {mapProToUnit("GVF")}</div>

      {/* SOUTH BASIC */}
      <div className="float i2 pfd southbasic text">000.00 {mapProToUnit("SVF")}</div>
      <div className="float i3 pfd southbasic text">000.00 {mapProToUnit("GVF")}</div>

      {/* SAITEX */}
      {/* <div className="float s7 i1 pfd col3 text">000.00 {mapProToUnit("SVF")}</div> */}
      <div className="float i2 pfd saitex text">{ saitex.realTime.length > 0 ? saitex.realTime[0].SVF.toFixed(2) : 0 } {mapProToUnit("SVF")}</div>
      <div className="float i3 pfd saitex text">{ saitex.realTime.length > 0 ? saitex.realTime[0].GVF.toFixed(2) : 0 } {mapProToUnit("GVF")}</div>

      {/* SINOMA */}
      {/* <div className="float s8 i1 pfd col3 text">000.00 {mapProToUnit("SVF")}</div> */}
      <div className="float i2 pfd sinoma text">{ sinoma.realTime.length > 0 ? sinoma.realTime[0].SVF.toFixed(2) : "000.00"} {mapProToUnit("SVF")}</div>
      <div className="float i3 pfd sinoma text">{ sinoma.realTime.length > 0 ? sinoma.realTime[0].GVF.toFixed(2) : "000.00"} {mapProToUnit("GVF")}</div>

      {/* SEAH */}
      {/* <div className="float s9 i1 pfd col3 text">000.00 {mapProToUnit("SVF")}</div> */}
      <div className="float i2 pfd seah text">{ seah.realTime.length > 0 ? seah.realTime[0].SVF.toFixed(2) : "000.00" } {mapProToUnit("SVF")}</div>
      <div className="float i3 pfd seah text">{ seah.realTime.length > 0 ? seah.realTime[0].GVF.toFixed(2) : "000.00" } {mapProToUnit("GVF")}</div>

      {/* <div className="float s10 i1 pfd col3 text">000.00 {mapProToUnit("SVF")}</div> */}
      <div className="float i2 pfd thehoa text">000.00 {mapProToUnit("SVF")}</div>
      <div className="float i3 pfd thehoa text">000.00 {mapProToUnit("GVF")}</div>

      {/* <div className="float s11 i1 pfd col3 text">000.00 {mapProToUnit("SVF")}</div> */}
      <div className="float i2 pfd wontae text">000.00 {mapProToUnit("SVF")}</div>
      <div className="float i3 pfd wontae text">000.00 {mapProToUnit("GVF")}</div>

      <img className="pfd" src="/assets/image/PFD.png" />
    </div>
  </div>
  
}

export const PFD = React.memo( _PFD )