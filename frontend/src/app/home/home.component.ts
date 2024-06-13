import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Person } from '../interfaces/person.interface';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  people = Array<Person>()

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    @Inject('SERVER_CONFIG') private serverConfig: any
  ) {}

  simpleForm = this.fb.group({
    lastName: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    location: ['', Validators.required]
  });

  ngOnInit() {
    this.http.get<Array<Person>>('http://' + this.serverConfig.API_HOST + ':3000', {responseType: 'json'})
    .subscribe(response => {
      this.people = response
    });
  }

  onSubmit() {
    if (this.simpleForm.valid) {
      this.http.post<Person>('http://' + this.serverConfig.API_HOST + ':3000', {
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
