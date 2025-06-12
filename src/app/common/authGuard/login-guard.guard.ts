import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ApiServiceService } from '../services/apiService.service';

@Injectable({
  providedIn: 'root'
})
export class loginGuard implements CanActivate {

  constructor(private apiService: ApiServiceService, private router: Router) {}

  canActivate(): Observable<boolean> {
    if (this.apiService.isLoggedIn()) {
      console.log("logged In")
      return of(true);
    }
    else{
      console.log("logged In")

      this.router.navigate(['/'])
      return of(false);
    }
  }
}