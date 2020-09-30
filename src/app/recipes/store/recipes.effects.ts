import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { switchMap, map, withLatestFrom, catchError } from 'rxjs/operators';

import * as RecipesActions from './recipes.actions';
import * as fromApp from '../../store/app.reducer';
import { Recipe } from 'src/app/models/recipe.model';

@Injectable()
export class RecipesEffects {

  private dbUrl: string = "https://ng-shopping-14631.firebaseio.com/recipes.json";

  @Effect()
  fetchRecipes = this.actions$.pipe(
    ofType(RecipesActions.FETCH_RECIPES),
    switchMap(() => this.http.get<Recipe[]>(this.dbUrl)),
    map(recipes => !recipes ? [] : recipes.map(recipe => ({ ...recipe, ingredients: recipe.ingredients ? recipe.ingredients : [] }))),
    map(recipes => new RecipesActions.SetRecipes(recipes))
  );

  @Effect({ dispatch: false })
  storeRecipes = this.actions$.pipe(
    ofType(RecipesActions.STORE_RECIPES),
    withLatestFrom(this.store.select('recipes')),
    switchMap(([_, recipesState]) => this.http.put(this.dbUrl, recipesState.recipes))
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<fromApp.AppState>
  ) { }
}
