import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { Recipe } from '../models/recipe.model';
import { Ingredient } from '../models/ingredient.model';

import * as ShoppingListActions from 'src/app/shopping-list/store/shopping-list.actions';
import * as fromApp from 'src/app/store/app.reducer';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();
  private _recipes: Recipe[] = [];

  constructor
  (
    private store: Store<fromApp.AppState>
  ) {}

  get recipes(): Recipe[] {
    return this._recipes.slice();
  }

  set recipes(recipes: Recipe[]) {
    this._recipes = recipes;
    this.dispatchChanges();
  }

  getRecipe(id: number) {
    return this.recipes[id];
  }

  addIngredientsToShoppingList(ingredients: Ingredient[]) {
    this.store.dispatch(new ShoppingListActions.AddIngredients(ingredients));
  }

  addRecipe(recipe: Recipe) {
    this._recipes.push(recipe);
    this.dispatchChanges();
  }

  updateRecipe(indexOfRecipe: number, newRecipe: Recipe) {
    this._recipes[indexOfRecipe] = newRecipe;
    this.dispatchChanges();
  }

  deleteRecipe(indexOfRecipe: number) {
    this._recipes.splice(indexOfRecipe, 1);
    this.dispatchChanges();
  }

  dispatchChanges() {
    this.recipesChanged.next(this.recipes);
  }
}
