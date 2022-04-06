interface ILGDS {
  count: number
}

interface ILGDSAction {
  type: "Action1"
}

const defaultState: ILGDS = {
  count: 0
}



export const lgds = (state = defaultState, actions: ILGDSAction):ILGDS => {
  return state
}