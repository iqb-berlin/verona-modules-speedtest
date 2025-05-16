import 'zone.js';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';

(async () => {
  const app = await createApplication({
    providers: [provideAnimations()]
  });

  const editorElement = createCustomElement(AppComponent, { injector: app.injector });
  customElements.define('speedtest-editor', editorElement);
})();
