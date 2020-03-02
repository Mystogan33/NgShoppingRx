import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { of } from 'rxjs';
import { switchMap, catchError, map, tap } from 'rxjs/operators';

import { Actions, ofType, Effect } from '@ngrx/effects';

import * as AuthActions from './auth.actions';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/models/user.model';
import { AuthService } from '../auth.service';


export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

export interface AuthRequestData {
  email: string;
  password: string;
  returnSecureToken: boolean;
}

const handleAuthentification = (resData : AuthResponseData) => {
  const expirationDate = new Date(
    new Date().getTime() + (+resData.expiresIn * 1000)
  );
  const user = new User(
    resData.email,
    resData.localId,
    resData.idToken,
    expirationDate
  );

  localStorage.setItem('userData', JSON.stringify(user));

  return new AuthActions.AuthenticateSuccess({
    email: user.email,
    userId: user.id,
    token: user.token,
    expirationDate,
    redirect: true
  });
};

const handleError = (errorRes: HttpErrorResponse) => {
  let errorMessage = "An unknown error occured!";

  if(!errorRes.error || !errorRes.error.error) {
    return of(new AuthActions.AuthenticateFail(errorMessage));
  } else {
    switch(errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
      errorMessage = "This email exists already";
      break;
      case 'EMAIL_NOT_FOUND':
      errorMessage = "No account registered with this email."
      break;
      case 'INVALID_PASSWORD':
      errorMessage = "Invalid password."
      break;
      default:
    }
    return of(new AuthActions.AuthenticateFail(errorMessage));
  }
};

@Injectable()
export class AuthEffects {

  @Effect()
  authSignup = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((signupAction: AuthActions.SignupStart) => {
      return this.http.post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
        {
          email: signupAction.payload.email,
          password: signupAction.payload.password,
          returnSecureToken: true
        }
      ).pipe(
        tap(resData => this.authService.setLogoutTimer(+resData.expiresIn * 1000)),
        map(handleAuthentification.bind(this)),
        catchError(handleError.bind(this))
      )
    })
  );

  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((authData: AuthActions.LoginStart) => {
      return this.http.post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
        {
          email: authData.payload.email,
          password: authData.payload.password,
          returnSecureToken: true
        }
      )
      .pipe(
        tap(resData => this.authService.setLogoutTimer(+resData.expiresIn * 1000)),
        map(handleAuthentification.bind(this)),
        catchError(handleError.bind(this))
      )
    })
  );

  @Effect({dispatch: false})
  authRedirect = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS, AuthActions.LOGOUT),
    tap((authSuccessAction: AuthActions.AuthenticateSuccess) => {
      if(authSuccessAction.payload.redirect) this.router.navigate(['/']);
    })
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {
      const userData: {
        email: string;
        id: string;
        _token: string;
        _tokenExpirationDate: string;
      } = JSON.parse(localStorage.getItem('userData'));

      if(!userData) {
        return { type: 'DUMMY'};
      }

      const loadedUser = new User(
        userData.email,
        userData.id,
        userData._token,
        new Date(userData._tokenExpirationDate)
      );

      if(loadedUser.token) {
        const expirationDuration = new Date(
          userData._tokenExpirationDate
        ).getTime() - new Date().getTime();

        this.authService.setLogoutTimer(expirationDuration);
        return new AuthActions.AuthenticateSuccess({
            email: loadedUser.email,
            userId: loadedUser.id,
            token: loadedUser.token,
            expirationDate: new Date(userData._tokenExpirationDate),
            redirect: false
          });
      }

      return { type: 'DUMMY'};
    })
  )

  @Effect({dispatch: false})
  authLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => {
      this.authService.clearLogoutTimer();
      localStorage.removeItem('userData');
      this.router.navigate(['/auth']);
    })
  )

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}
}
