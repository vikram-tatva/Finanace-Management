// import { CanActivateFn } from '@angular/router';

// export const authGuard: CanActivateFn = (route, state) => {
//   return true;
// };
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ApiServiceService } from '../services/apiService.service';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate {

  constructor(private apiService: ApiServiceService, private router: Router) {}

  canActivate(): Observable<boolean> {
    if (this.apiService.isLoggedIn()) {
      console.log("logged In")
      this.router.navigate(['/admin']); // Redirect to home or any other route
      return of(false);
    }
    else{
      return of(true);
    }
  }
}
