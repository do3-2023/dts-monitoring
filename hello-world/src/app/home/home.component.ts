import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  message = "Loading..."
  constructor(
    private http: HttpClient,
    @Inject('SERVER_CONFIG') private serverConfig: any
  ) {}

  ngOnInit() {
    this.http.get('http://' + this.serverConfig.API_URL + ':3000', {responseType: 'text'})
    .subscribe(response => {
      this.message = response;
    });
  }
}
