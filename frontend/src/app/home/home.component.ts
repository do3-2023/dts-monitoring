import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Person } from '../interfaces/person.interface';
import { StateKey, TransferState, makeStateKey } from '@angular/platform-browser';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  people: Person[] = []
  apiUrl = ""

  simpleForm = this.fb.group({
    lastName: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    location: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    @Inject('SERVER_CONFIG') private serverConfig: any,
    private tstate: TransferState
  ) {}

  ngOnInit() {
    const peopleListKey: StateKey<Person[]> = makeStateKey('people-list')
    const apiUrlKey: StateKey<string> = makeStateKey('apiUrl')
    if (this.tstate.hasKey(peopleListKey)) {
      this.people = this.tstate.get(peopleListKey, [])
      this.apiUrl = this.tstate.get(apiUrlKey, "")
      this.tstate.remove(peopleListKey)
      this.tstate.remove(apiUrlKey)
    }
    else {
      this.apiUrl = this.serverConfig.API_URL
      this.tstate.set(apiUrlKey, this.apiUrl)
      this.http.get<Array<Person>>(this.apiUrl, {responseType: 'json'})
      .subscribe(response => {
        this.people = response
        this.tstate.set(peopleListKey, this.people)
      });
    }
  }

  onSubmit() {
    if (this.simpleForm.valid) {
      this.http.post<Person>(this.apiUrl, {
        last_name: this.simpleForm.value.lastName,
        phone_number: this.simpleForm.value.phoneNumber,
        location: this.simpleForm.value.location
      },{responseType: 'json'})
      .subscribe(response => {
        this.people.push(response)
        this.simpleForm.reset()

      });
    } else {
      console.log('Form is invalid');
    }
  }
}
