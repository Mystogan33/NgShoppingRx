import { TestBed } from '@angular/core/testing';

import { RecipesResolverService } from './recipes-resolver.service';

describe('RecipesResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RecipesResolverService = TestBed.get(RecipesResolverService);
    expect(service).toBeTruthy();
  });
});
