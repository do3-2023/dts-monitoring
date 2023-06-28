import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  message = "Loading..."
  constructor(private http: HttpClient) {}

  ngOnInit() {
    // this.http.get<string>('http://localhost:3080')
    // .subscribe(message => {
    //   this.message = message;
    // });
  }
}
