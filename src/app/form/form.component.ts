import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilKeyChanged,
  EMPTY,
  filter,
  from,
  map,
  Observable,
  of,
  reduce,
  scan,
  shareReplay,
  single,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { FormControl } from '@angular/forms';
import { __values } from 'tslib';
@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  users$: BehaviorSubject<User[]>;
  users: User[] = [];
  value;
  value$: Observable<string>;
  filteredUsers$: Observable<User[]>;
  idList;

  constructor(private http: HttpClient) {
    this.users$ = new BehaviorSubject<User[]>([]);
    this.value = new FormControl('');

    this.value$ = this.value.valueChanges;
    this.idList = new FormControl([]);
    this.idList.valueChanges.subscribe((ids) => this.refreshUsers(ids));

    let seed: User[] = [];
    this.filteredUsers$ = this.value$.pipe(
      startWith(''),
      shareReplay(),
      switchMap((switchedValue) =>
        this.users$.pipe(
          switchMap((switchedUsers) => {
            return of( switchedUsers.filter(user=> user.name.includes(switchedValue)))
          })
        )
      )
    );
  }

  ngOnInit(): void {
    this.http
      .get<User[]>('https://jsonplaceholder.typicode.com/users')
      .subscribe((users) => {
        this.users$.next(users);
      });
  }

  refreshUsers(ids?: number[]| string[]) {
    if (!ids) {ids= ['']};
    if  (!ids[0]){ids= ['']};
    this.users$.next([]);

    ids?.forEach((id) => {
      this.http
        .get<User[] | User>(`https://jsonplaceholder.typicode.com/users/${id}`)
        .subscribe((users) => {
          if (users instanceof Array) {
            this.users$.next([...this.users$.getValue(), ...users]);
          } else {
            this.users$.next([...this.users$.getValue(), users]);
          }
        });
    });
  }
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: {
    lat: string;
    lng: string;
  };
}

interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}
