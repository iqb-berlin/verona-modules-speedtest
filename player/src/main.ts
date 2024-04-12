import { bootstrapApplication, createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { createCustomElement } from '@angular/elements';
import 'zone.js';

// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));

(async () => {
  const app = await createApplication({
    providers: [provideAnimations()]
  });

  const editorElement = createCustomElement(AppComponent, { injector: app.injector });
  customElements.define('speedtest-player', editorElement);
})();
