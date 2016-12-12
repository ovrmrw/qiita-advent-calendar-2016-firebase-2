import { Observable } from 'rxjs/Rx';
import { AppState } from './store.types';


export class UpdateContentAction {
  constructor(public content: string) { }
}

export class RestoreAction {
  constructor(public cloudState: AppState) { }
}


/**
 * DON'T import anywhere! Exporting just for bundling.
 */
export type _Actions = UpdateContentAction | RestoreAction;


export type Action = _Actions | Promise<_Actions> | Observable<_Actions>;
