import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { Store } from '@ngrx/store';

import { map, takeUntil } from 'rxjs/operators';

import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../store/recipes.actions';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  id: number;
  editMode: boolean = false;
  recipeForm: FormGroup;
  subcriptionHandler = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
        this.id = +params['id'];
        this.editMode = params['id'] != null;
        this.initForm();
      }
    )
  }

  onSubmit() {
    if(this.editMode) {
      this.store.dispatch(new RecipesActions.UpdateRecipe({
        index: this.id,
        newRecipe: this.recipeForm.value
      }));
    } else {
      this.store.dispatch(new RecipesActions.AddRecipe(this.recipeForm.value));
    }
    this.onCancel();
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  onAddIngredient() {
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup({
        "name": new FormControl(null, Validators.required),
        "amount": new FormControl(null, [
          Validators.required,
          Validators.pattern(/^[1-9]+[0-9]*$/)
        ])
      })
    )
  }

  onRemoveIngredient(indexOfIngredient: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(indexOfIngredient);
  }

  private initForm() {
    let editedRecipe = {
      name: '',
      imagePath: '',
      description: '',
      ingredients: new FormArray([])
    };

    if(this.editMode) {
      this.store
      .select('recipes')
      .pipe(
        takeUntil(this.subcriptionHandler),
        map(recipeState => {
          return recipeState.recipes.find((recipe, index) => {
            return index === this.id;
          })
        })
      )
      .subscribe(recipe => {
        editedRecipe.name = recipe.name;
        editedRecipe.description = recipe.description;
        editedRecipe.imagePath = recipe.imagePath;

        if(recipe.ingredients) {
          recipe.ingredients.forEach(ingredient => {
            editedRecipe.ingredients.push(
              new FormGroup({
                'name': new FormControl(ingredient.name, Validators.required),
                'amount': new FormControl(ingredient.amount, [
                  Validators.required,
                  Validators.pattern(/^[1-9]+[0-9]*$/)
                ])
              })
            )
          })
        }
      })
    }

    this.recipeForm =  new FormGroup({
      'name': new FormControl(editedRecipe.name, Validators.required),
      'imagePath': new FormControl(editedRecipe.imagePath, Validators.required),
      'description': new FormControl(editedRecipe.description, Validators.required),
      'ingredients': editedRecipe.ingredients
    });
  }

  getControls() {
    return (<FormArray>this.recipeForm.get('ingredients')).controls;
  }

  ngOnDestroy() {
    this.subcriptionHandler.next();
  }

}
