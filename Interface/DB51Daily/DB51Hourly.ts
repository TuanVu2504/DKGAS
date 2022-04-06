export interface IDB51CSVHourly {
  /**@description 1->25 */
  Record: string,
  /**@description MM/dd/yyyy */
  Date: string,
  /**@description HH:mm:dd */
  'UTC Time': string
  /**@description 0->24 */
  Time: string,
  P_line1: string,
  T_line1: string,
  Vb_line1: string,
  Vm_line1: string,
  Energy_line1: string,
  P_line2: string,
  T_line2: string,
  Vb_line2: string,
  Vm_line2: string,
  Energy_line2: string
}