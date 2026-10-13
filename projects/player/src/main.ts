import 'zone.js';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { AppComponent } from './app/app.component';

void (async () => {
  const app = await createApplication();

  const editorElement = createCustomElement(AppComponent, { injector: app.injector });
  customElements.define('speedtest-player', editorElement);
})();
