import { combineReducers } from 'redux';
import { lgds } from './ldgs.reducer'
import { stationsState } from './stations.reducer'
import { TypedUseSelectorHook, useSelector } from 'react-redux'
import { authentication } from './authentication'
import { gcDataState } from './gcdata'
import { modal } from './modal'
export const rootReducer = combineReducers({ 
  lgds,
  modal,
  stationsState,
  authentication,
  gcDataState,
});

// export = rootReducer

export type RootState = ReturnType<typeof rootReducer>
export type ChildRootStateKey = keyof RootState
export type ChildRootState<T extends ChildRootStateKey> = Pick<RootState, T>[T]

export const useSelectorTyped: TypedUseSelectorHook<RootState> = useSelector 