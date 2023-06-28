import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { RESPONSE } from '@nguniversal/express-engine/tokens'
import { Response } from 'express'

@Component({
  selector: 'app-health-check',
  templateUrl: './health-check.component.html',
  styleUrls: ['./health-check.component.css']
})
export class HealthCheckComponent implements OnInit {
  constructor(private http: HttpClient, @Optional() @Inject(RESPONSE) private response: Response) {}

  ngOnInit(): void {
    console.log("healthz component");
    if (this.response) {
      console.log("response object is here");
      this.http.get<string>('localhost:3080')
      .subscribe(
        message => this.response.status(200),
        err => this.response.status(500)
      )
    }
  }
}
