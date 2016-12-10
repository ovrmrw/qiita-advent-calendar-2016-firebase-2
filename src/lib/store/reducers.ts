import { Dispatcher, StateReducer, NonStateReducer } from './common';
import { Action, UpdateContentAction, RestoreAction } from './actions';


export const contentStateReducer: StateReducer<string> =
  (initState: string, dispatcher$: Dispatcher<Action>) =>
    dispatcher$.scan<typeof initState>((state, action) => {
      if (action instanceof UpdateContentAction) {
        return action.content;
      } else if (action instanceof RestoreAction) {
        return action.cloudState.content || '';
      } else {
        return state;
      }
    }, initState);


export const restoreStateMapper: NonStateReducer<boolean> =
  (dispatcher$: Dispatcher<Action>) =>
    dispatcher$.map(action => {
      if (action instanceof RestoreAction) {
        return true;
      } else {
        return false;
      }
    });


export const afterRestoredStateReducer: StateReducer<boolean> =
  (initState: boolean, dispatcher$: Dispatcher<Action>) =>
    dispatcher$.scan<typeof initState>((state, action) => {
      if (action instanceof RestoreAction) {
        return true;
      } else {
        return state;
      }
    }, initState);
