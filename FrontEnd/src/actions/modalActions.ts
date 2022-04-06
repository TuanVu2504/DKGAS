import { IOpenModalPayload } from '../../../Interface'

export interface IOpenModal {
  type: "OpenModal", payload: IOpenModalPayload
}

export interface ICloseModal {
  type: "CloseModal"
}

export interface IModalConfirmed {
  type: "Confirmed", actionID: string
}

export function confirmActionID(actionID: string): IModalConfirmed {
  return { type: "Confirmed", actionID }
}
export function openModal(payload: IOpenModalPayload): IOpenModal{
  return { type: "OpenModal", payload }
}

export function closeModal(): ICloseModal { return { type: "CloseModal" }}

export type ModalActions = ICloseModal | IOpenModal | IModalConfirmed