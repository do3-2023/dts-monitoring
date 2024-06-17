import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { StateKey, TransferState, makeStateKey } from '@angular/platform-browser';
import { RESPONSE } from '@nguniversal/express-engine/tokens'
import { Response } from 'express'

@Component({
  selector: 'app-health-check',
  templateUrl: './health-check.component.html',
  styleUrls: ['./health-check.component.css']
})
export class HealthCheckComponent implements OnInit {
  apiUrl = ""
  constructor(
    private http: HttpClient,
    private tstate: TransferState,
    @Optional() @Inject(RESPONSE) private response: Response,
    @Inject('SERVER_CONFIG') private serverConfig: any
  ) {}

  ngOnInit(): void {
    if (this.response) {
      const apiUrlKey: StateKey<string> = makeStateKey('apiUrl')
      if (this.tstate.hasKey(apiUrlKey)) {
        this.apiUrl = this.tstate.get(apiUrlKey, "")
        this.tstate.remove(apiUrlKey)
      }
      else {
        this.apiUrl = this.serverConfig.API_URL
        this.tstate.set(apiUrlKey, this.apiUrl)
      }
      this.http.get(this.apiUrl, {responseType: 'text'})
      .subscribe({
        next: (mess) => this.response.status(200),
        error: (err) => this.response.status(500),
      })
    }
  }
}
