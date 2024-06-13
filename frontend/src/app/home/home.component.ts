import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Person } from '../interfaces/person.interface';
import { StateKey, TransferState, makeStateKey } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  people: Person[] = []

  constructor(
    private http: HttpClient,
    @Inject('SERVER_CONFIG') private serverConfig: any,
    private tstate: TransferState
  ) {}

  ngOnInit() {
    const stateKey: StateKey<Person[]> = makeStateKey('people-list')
    if (this.tstate.hasKey(stateKey)) {
      this.people = this.tstate.get(stateKey, [])
      this.tstate.remove(stateKey)
    }
    else {
      this.http.post<Person>('http://' + this.serverConfig.API_HOST + ':3000', {
          last_name: 'Potter',
          phone_number: '77777777',
          location: 'London'
        },{responseType: 'json'}).subscribe(response => {
          this.people.push(response)
          this.tstate.set(stateKey, this.people)
        })
      this.http.get<Array<Person>>('http://' + this.serverConfig.API_HOST + ':3000', {responseType: 'json'})
      .subscribe(response => {
        this.people = response
        this.tstate.set(stateKey, this.people)
      });
    }
  }
}
