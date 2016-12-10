import { AppState } from './store.types';


export class UpdateContentAction {
  constructor(public content: string | null) { }
}

export class RestoreAction {
  constructor(public cloudState: AppState) { }
}


export type Action = UpdateContentAction | RestoreAction;
