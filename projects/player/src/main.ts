import 'zone.js';
import { createApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { createCustomElement } from '@angular/elements';
import { AppComponent } from './app/app.component';

(async () => {
  const app = await createApplication({
    providers: [provideAnimations()]
  });

  const editorElement = createCustomElement(AppComponent, { injector: app.injector });
  customElements.define('speedtest-player', editorElement);
})();
