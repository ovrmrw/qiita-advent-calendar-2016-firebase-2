import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { Store, Dispatcher, Action, UpdateContentAction } from '../lib/store';
import { Disposer } from '../lib/class';


@Component({
  selector: 'app-root',
  template: `
    <h2>Firebase as a Store</h2>
    <div>content:</div>
    <textarea rows=10 cols=100 [(ngModel)]="content"></textarea>
    <hr />
    <div>content:</div>
    <pre>{{content}}</pre>
  `,
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends Disposer implements OnInit, OnDestroy {
  content: string;


  constructor(
    private dispatcher$: Dispatcher<Action>,
    private store: Store,
    private cd: ChangeDetectorRef,
    private el: ElementRef,
  ) {
    super();
  }


  ngOnInit() {
    this.disposable = this.store.getState().subscribe(state => {
      this.content = state.content;
      this.cd.markForCheck();
    });

    this.disposable = Observable.fromEvent(this.el.nativeElement, 'keyup')
      .debounceTime(200)
      .subscribe(() => {
        this.dispatcher$.next(new UpdateContentAction(this.content));
      });
  }


  ngOnDestroy() {
    this.disposeSubscriptions();
  }

}
