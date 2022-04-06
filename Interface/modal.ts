export interface IModalState extends IOpenModalPayload {
  open: boolean
  confirmedState: {
    ok: boolean,
    actionID: string
  }
}
        
export interface IOpenModalPayload {
  type: "UserInteraction"  | "NonUserInteraction"
  title?: string,
  message: IModalMessage,
  buttons: IModalButtonState[]
}

export type IModalMessage = {
  type: "string"
  content: string 
} | {
  type: "stringarray",
  content: string[]
} | {
  type: "objectarray",
  content: object[]
}

export type IModalButtonState = {
  type: "confirm",
  actionid: string,
  text: string
} | {
  type: "cancel"
  text: string
}