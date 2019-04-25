import {Observable, of, throwError} from 'rxjs';
import {HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {delay, dematerialize, materialize, mergeMap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {ContactModel} from '../contact-form/contact.model';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // wrap in delayed observable to simulate server api call
    return of(null).pipe(mergeMap(() => {
      if (request.url.includes('/contacts/delete/') && request.method === 'DELETE') {
        const id = request.url.split('/contacts/delete/')[1];
        let contacts: ContactModel[] = JSON.parse(localStorage.getItem('contacts')) || [];
        contacts = contacts.filter(item => item.id !== id);
        localStorage.setItem('contacts', JSON.stringify(contacts));
        console.log('request', request);
        return ok(request.body);
      }

      if (request.url.endsWith('/contacts') && request.method === 'PUT') {
        const contacts: ContactModel[] = JSON.parse(localStorage.getItem('contacts')) || [];
        contacts.push(request.body as ContactModel);
        localStorage.setItem('contacts', JSON.stringify(contacts));
        console.log('request', request);
        return ok(request.body);
      }
      // get all users
      if (request.url.endsWith('/contacts') && request.method === 'GET') {
        const pageSize = Number(request.params.get('pageSize'));
        const pageIndex = Number(request.params.get('pageIndex'));
        const startIndex = pageSize * pageIndex;
        const endIndex = startIndex + pageSize;
        const list = JSON.parse(localStorage.getItem('contacts')) || [];
        console.log('request', request);
        console.log('response body', {count: list.length, items: list.slice(startIndex, endIndex)});
        return ok({count: list.length, items: list.slice(startIndex, endIndex)});
      }
      // pass through any requests not handled above
      return next.handle(request);
    }))
      .pipe(materialize())
      .pipe(delay(500))
      .pipe(dematerialize());

    // private helper functions

    function ok(body) {
      return of(new HttpResponse({status: 200, body}));
    }

    function unauthorised() {
      return throwError({status: 401, error: {message: 'Unauthorised'}});
    }

    function error(message) {
      return throwError({status: 400, error: {message}});
    }
  }
}

export let fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
