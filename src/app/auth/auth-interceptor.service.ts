import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpParams } from '@angular/common/http';

import { take, exhaustMap, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import * as fromApp from 'src/app/store/app.reducer';


@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(
    private store: Store<fromApp.AppState>
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.store.select('auth')
    .pipe(
      take(1),
      map(authState => authState.user),
      exhaustMap(user => {
        if(user) {
          return next.handle(req.clone({
              params: new HttpParams().set('auth', user.token)
            }));
        }
        else return next.handle(req);
      })
    );
  }
}
