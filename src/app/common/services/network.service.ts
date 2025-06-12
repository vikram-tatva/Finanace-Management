import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';  // Used for navigation on specific errors

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private url = `https://jsonserver-69rb.onrender.com`;
  constructor(private http: HttpClient, private router: Router) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Generic GET method with params
  get<T>(url: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      for (const key of Object.keys(params)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    return this.http.get<T>(this.url + url, { headers: this.getHeaders(), params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Generic GET ById method with params
  getById<T>(url: string,id:string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      for (const key of Object.keys(params)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    return this.http.get<T>(this.url + url + "/" + id, { headers: this.getHeaders(), params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Generic POST method
  post<T>(url: string, data?: any, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      for (const key of Object.keys(params)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    return this.http.post<T>(this.url + url, data, { headers: this.getHeaders(), params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Generic PUT method
  put<T>(url: string, data: any, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      for (const key of Object.keys(params)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    return this.http.put<T>(this.url + url, data, { headers: this.getHeaders(), params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Generic DELETE method
  delete<T>(url: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      for (const key of Object.keys(params)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    return this.http.delete<T>(this.url + url, { headers: this.getHeaders(), params: httpParams })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage: string = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 401: // Unauthorized
          errorMessage = 'You are not authorized. Redirecting to login...';
          this.router.navigate(['/login']);
          break;
        case 403: // Forbidden
          errorMessage = 'Access to this resource is denied!';
          break;
        case 404: // Not Found
          errorMessage = 'Requested resource not found.';
          break;
        case 500: // Internal Server Error
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Server-side error: ${error.status} ${error.message}`;
          break;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
