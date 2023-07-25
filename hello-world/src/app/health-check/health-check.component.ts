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
    if (this.response) {
      this.http.get('http://localhost:3000/healthz', {responseType: 'text'})
      .subscribe({
        next: (mess) => this.response.status(200),
        error: (err) => this.response.status(500),
      })
    }
  }
}
