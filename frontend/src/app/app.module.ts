import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { serverConfig } from 'src/server-config';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HealthCheckComponent } from './health-check/health-check.component';
import { HomeComponent } from './home/home.component';
import { ReactiveFormsModule } from '@angular/forms';

export function initializeApp(): () => Promise<any> {
  return () => Promise.resolve(serverConfig);
}

@NgModule({
  declarations: [
    AppComponent,
    HealthCheckComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
    },
    { provide: 'SERVER_CONFIG', useValue: serverConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
