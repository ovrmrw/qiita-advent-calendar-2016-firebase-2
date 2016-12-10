import { Injectable, Inject, Optional, NgZone } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject, Subject } from 'rxjs/Rx';
import * as uuid from 'uuid';

import { Dispatcher, Provider, ReducerContainer } from './common';
import { FirebaseEffector } from './firebase-effector';
import { AppState } from './store.types';
import { Action, RestoreAction } from './actions';
import { contentStateReducer, restoreStateMapper, afterRestoredStateReducer } from './reducers';


const initialState: AppState = {
  content: '',
  restore: false,
  afterRestored: false,
  uuid: uuid.v4(), // 起動毎にクライアントを識別するためのユニークなIDを生成する。
};


@Injectable()
export class Store {
  private provider$: Provider<AppState>;
  private dispatcherQueue$: Dispatcher<Action>;
  private firebaseEffectorTrigger$ = new Subject<AppState>();
  private firebaseRestoreFinished$ = new Subject<boolean>();


  constructor(
    private zone: NgZone,
    private dispatcher$: Dispatcher<Action>,
    @Inject(FirebaseEffector) @Optional()
    private firebaseEffector: FirebaseEffector | null,
  ) {
    this.dispatcherQueue$ = // DispatcherではなくDispatcherQueueをReducerに代入する。
      this.dispatcher$
        .concat() // Actionを発行順に処理する。
        .share() as Dispatcher<Action>;

    this.provider$ = new BehaviorSubject<AppState>(initialState);
    this.combineReducers();
    this.applyEffectors();
  }


  private combineReducers(): void {
    ReducerContainer
      .zip<AppState>(...[
        contentStateReducer(initialState.content, this.dispatcherQueue$),
        restoreStateMapper(this.dispatcherQueue$),
        afterRestoredStateReducer(initialState.afterRestored, this.dispatcherQueue$),

        (content, restore, afterRestored): AppState => {
          const obj = { content, restore, afterRestored };
          return Object.assign<{}, AppState, {}>({}, initialState, obj);
        }
      ])
      .subscribe(newState => {
        console.log('newState:', newState);
        this.zone.run(() => { // Zoneが捕捉できるようにするためにzone.runでラップしている。
          this.provider$.next(newState);
        });
        this.effectAfterReduced(newState);
      });
  }


  private effectAfterReduced(state: AppState): void {
    this.firebaseEffectorTrigger$.next(state);
  }


  private applyEffectors(): void {
    if (this.firebaseEffector) {

      /* Firebase Inbound (Firebaseからデータを取得する) */
      this.firebaseEffector.connect$<AppState>('free')
        // .filter(() => false) // 一時的にInboundを止める。
        .map(cloudState => {
          if (cloudState) {
            return cloudState;
          } else {
            this.firebaseRestoreFinished$.next(true);
            return initialState;
          }
        }) // クラウドからデータを取得できない場合はinitialStateに置き換える。
        .filter(state => initialState.uuid !== state.uuid) // 自分以外のクライアントがクラウドデータを変更した場合だけ自分に反映させる。
        .subscribe(state => {
          console.log('============================= Firebase Inbound (uuid:' + state.uuid + ')');
          this.dispatcher$.next(new RestoreAction(state));
          this.firebaseRestoreFinished$.next(true);
        });


      /* Firebase Outbound (データ更新毎にFirebaseへ保存する) */
      this.firebaseEffectorTrigger$
        // .filter(() => false) // 一時的にOutboundを止める。
        .combineLatest(this.firebaseRestoreFinished$, (state, afterRestored) => {
          return { state, afterRestored };
        })
        .filter(obj => obj.afterRestored) // RestoreAction発行済みの場合は通過する。
        .filter(obj => !obj.state.restore) // RestoreActionではない場合のみ通過する。
        .map(obj => obj.state)
        .debounceTime(200)
        .subscribe(state => {
          console.log('============================= Firebase Outbound (uuid:' + state.uuid + ')');
          if (this.firebaseEffector) {
            this.firebaseEffector.saveCurrentState('free', state);
          }
        });

    }
  }


  getState(): Observable<AppState> {
    return this.provider$;
  }

}
