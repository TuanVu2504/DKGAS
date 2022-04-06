import { createStore, applyMiddleware, Action } from 'redux';
import thunkMiddleware, { ThunkAction } from 'redux-thunk';
import  { rootReducer, RootState } from '../reducers';
import { createBrowserHistory } from 'history'

export const store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware,
  )
);

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>

export const history = createBrowserHistory();