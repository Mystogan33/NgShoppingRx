import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as ShoppingListActions from './store/shopping-list.actions';
import * as fromApp from '../store/app.reducer';
import { Ingredient } from '../models/ingredient.model';
import { trigger, style, transition, animate, query, stagger, animateChild } from '@angular/animations';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss'],
  animations: [
    trigger('list', [
      transition(':enter', [
        query('@items', stagger(200, animateChild()))
      ]),
    ]),
    trigger('items', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0}),
        animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)',
        style({ transform: 'scale(1)', opacity: 1}))
      ]),
      transition(':leave', [
        style({ transform: 'scale(1)', opacity: 1, height: '*', 'background-color': 'red', 'color': 'white' }),
        animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)',
        style({
          transform: 'scale(0.5)', opacity: 0,
          height: '0px', margin: '0px'
        }))
      ])
    ])
  ]
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  ingredients:  Observable<{ ingredients: Ingredient[] }>;
  state: boolean = true;

  constructor(
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit() {
    this.ingredients = this.store.select('shoppingList');
  }

  onEditItem(indexOfIngredient: number) {
    this.store.dispatch(new ShoppingListActions.StartEdit(indexOfIngredient));
    this.state = !this.state;
  }

  ngOnDestroy() {}
}
