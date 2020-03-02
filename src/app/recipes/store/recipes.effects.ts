import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { switchMap, map, withLatestFrom, catchError } from 'rxjs/operators';

import * as RecipesActions from './recipes.actions';
import * as fromApp from '../../store/app.reducer';
import { Recipe } from 'src/app/models/recipe.model';
import { of } from 'rxjs';

@Injectable()
export class RecipesEffects {

  private dbUrl: string = "https://ng-shopping-14631.firebaseio.com/recipes.json";

  @Effect()
  fetchRecipes = this.actions$.pipe(
    ofType(RecipesActions.FETCH_RECIPES),
    switchMap(() => {
      return this.http
      .get<Recipe[]>(this.dbUrl)
    }),
    map(recipes => {
      if(!recipes) {
        return [];
      }
      return recipes.map((recipe: Recipe) => {
        return {
          ...recipe,
          ingredients: recipe.ingredients ? recipe.ingredients : []
        }
      })
    }),
    map(recipes => new RecipesActions.SetRecipes(recipes))
  );

  @Effect({dispatch: false})
  storeRecipes = this.actions$.pipe(
    ofType(RecipesActions.STORE_RECIPES),
    withLatestFrom(this.store.select('recipes')),
    switchMap(([actionData, recipesState]) => {
      console.log(recipesState.recipes);
      return this.http
      .put(this.dbUrl, recipesState.recipes)
    })
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<fromApp.AppState>
  ) {}
}
