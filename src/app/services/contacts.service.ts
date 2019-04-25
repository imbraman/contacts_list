import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {environment} from '../../environments/environment';
import {ContactModel} from '../contact-form/contact.model';
import * as uuid from 'uuid';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private contactsSubject: ReplaySubject<ContactModel[]> = new ReplaySubject(1);
  private pageSize: number;
  private pageIndex: number;

  constructor(private http: HttpClient) {
  }

  /**
   * get contacs subject as observable
   */
  getContactsSubject(): Observable<ContactModel[]> {
    return this.contactsSubject.asObservable();
  }

  /**
   * get contacts from server
   * @param pageSize - page size.
   * @param pageIndex - page index (starting from 0).
   */
  fetchContacts(pageSize: number, pageIndex: number) {
    this.http.get<ContactModel[]>(`${environment.apiUrl}/contacts`, {
      params: {
        pageSize: pageSize.toString(),
        pageIndex: pageIndex.toString()
      }
    }).pipe(tap(contacts => {
      this.pageIndex = pageIndex;
      this.pageSize = pageSize;
      this.contactsSubject.next(contacts);
    })).subscribe();
  }

  /**
   * Put new contact to the list
   * @param contact - new contact.
   */
  putContact(contact: ContactModel) {
    contact.id = uuid.v4();
    this.http.put<any>(`${environment.apiUrl}/contacts`, contact).pipe(tap(() => {
      this.fetchContacts(this.pageSize, this.pageIndex);
    })).subscribe();
  }

  /**
   * Delete contact from the list
   * @param id - id of contact.
   */
  deleteContact(id: string) {
    this.http.delete<any>(`${environment.apiUrl}/contacts/delete/${id}`).pipe(tap(() => {
      this.fetchContacts(this.pageSize, this.pageIndex);
    })).subscribe();
  }
}
