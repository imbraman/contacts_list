import {Component, OnDestroy, OnInit} from '@angular/core';
import {ContactsService} from '../services/contacts.service';
import {ActivatedRoute, Params} from '@angular/router';
import {debounceTime, switchMap} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {MatTableDataSource, PageEvent} from '@angular/material';

@Component({
  selector: 'app-contacts-table',
  templateUrl: './contacts-table.component.html',
  styleUrls: ['./contacts-table.component.css']
})
export class ContactsTableComponent implements OnInit, OnDestroy {

  constructor(private contactService: ContactsService, private route: ActivatedRoute) {
  }

  public dataSource: any;
  public contactsCount: number;
  public pageSize: number;
  public pageIndex: number;
  private sortingDirection: string;
  private paramsSubscription: Subscription;
  displayedColumns: string[] = ['username', 'email', 'phone', 'birthday', 'delete'];

  ngOnInit() {
    this.paramsSubscription = this.route.queryParamMap.pipe(
      debounceTime(0),
      switchMap(params => {
        this.pageSize = Number(params.get('pageSize')) || 3;
        this.pageIndex = Number(params.get('pageIndex')) || 0;
        console.log(params, this.pageIndex, params.get('pageIndex'));
        this.sortingDirection = params.get('sortingDirection');
        this.contactService.fetchContacts(this.pageSize, this.pageIndex);
        return this.contactService.getContactsSubject();
      })
    ).subscribe((contactsData: any) => {
      this.contactsCount = contactsData.count;
      this.dataSource = new MatTableDataSource(contactsData.items);
    });
  }

  /**
   * Delete contact from the list
   * @param id - id of contact.
   */
  deleteContact(id: string) {
    this.contactService.deleteContact(id);
  }

  /**
   * Fetch contacts data fot the new pageEvent params
   * @param pageEvent - pageEvent object.
   */
  onPageChange(pageEvent: PageEvent) {
    this.contactService.fetchContacts(pageEvent.pageSize, pageEvent.pageIndex);
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
  }


}
