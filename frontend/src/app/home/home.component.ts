import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Person } from '../interfaces/person.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  people = Array<Person>()
  constructor(
    private http: HttpClient,
    @Inject('SERVER_CONFIG') private serverConfig: any
  ) {}

  ngOnInit() {
    this.http.get<Array<Person>>('http://' + this.serverConfig.API_HOST + ':3000', {responseType: 'json'})
    .subscribe(response => {
      this.people = response;
    });
  }
}
