import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ApiServiceService } from '../services/apiService.service';
import { loginGuard } from './login-guard.guard';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('loginGuard', () => {
  let guard: loginGuard;
  let apiService: ApiServiceService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule,HttpClientTestingModule],
      providers: [loginGuard, ApiServiceService]
    });

    guard = TestBed.inject(loginGuard);
    apiService = TestBed.inject(ApiServiceService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation if user is logged in', () => {
    jest.spyOn(apiService, 'isLoggedIn');
    const canActivate$: Observable<boolean> = guard.canActivate();

    canActivate$.subscribe(canActivate => {
      expect(canActivate).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled(); // Ensure router.navigate is not called
    });
  });

  it('should navigate to "/" and disallow activation if user is not logged in', () => {
    jest.spyOn(apiService, 'isLoggedIn');
    const navigateSpy = jest.spyOn(router, 'navigate');
    const canActivate$: Observable<boolean> = guard.canActivate();

    canActivate$.subscribe(canActivate => {
      expect(canActivate).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });
});
