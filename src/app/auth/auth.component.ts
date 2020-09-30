import { Component, OnInit, ComponentFactoryResolver, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/directives/placeholder.directive';
import { takeUntil, take } from 'rxjs/operators';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {
  isLoginMode = true;
  isLoading = false;
  error: string = null;
  onDestroy: Subject<any> = new Subject<any>();
  @ViewChild(PlaceholderDirective, { static: false }) alertHost: PlaceholderDirective;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private store: Store<fromApp.AppState>
  ) { }

  ngOnInit() {
    this.store.select('auth')
      .pipe(takeUntil(this.onDestroy))
      .subscribe(authState => {
        this.isLoading = authState.loading;
        this.error = authState.authError;

        if (this.error) this.showErrorAlert(this.error);
      });
  }

  onSwitchMode() { this.isLoginMode = !this.isLoginMode; }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    } else {
      const [email, password] = [form.value.email, form.value.password];

      const authCredientials = {
        email,
        password
      };

      const action = this.isLoginMode
        ? new AuthActions.LoginStart(authCredientials)
        : new AuthActions.SignupStart(authCredientials);

      this.store.dispatch(action);
    }

    form.reset();
  }

  onHandleError() {
    this.store.dispatch(new AuthActions.ClearError());
  }


  private showErrorAlert(errorMessage: string) {
    const alertCmpFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
    const hostViewContainerRef = this.alertHost.viewContainerRef;
    hostViewContainerRef.clear();
    const componentRef = hostViewContainerRef.createComponent(alertCmpFactory);

    componentRef.instance.message = errorMessage;
    componentRef.instance.close
      .pipe(take(1))
      .subscribe(() => {
        hostViewContainerRef.clear();
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

}
