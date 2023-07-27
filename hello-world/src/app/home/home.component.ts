import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  message = "Loading..."
  constructor(
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.http.get('http://api.back.svc.cluster.local:3000', {responseType: 'text'})
    .subscribe(response => {
      this.message = response;
    });
  }
}
