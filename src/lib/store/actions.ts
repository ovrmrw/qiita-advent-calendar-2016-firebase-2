import { Observable } from 'rxjs/Rx';
import { AppState } from './store.types';


export class UpdateContentAction {
  constructor(public content: string) { }
}

export class RestoreAction {
  constructor(public cloudState: AppState) { }
}


export type AllActions = UpdateContentAction | RestoreAction;


export type Action = AllActions | Promise<AllActions> | Observable<AllActions>;
