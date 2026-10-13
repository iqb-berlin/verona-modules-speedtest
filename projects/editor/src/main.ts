import { provideZoneChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { AppComponent } from './app/app.component';

void (async () => {
  const app = await createApplication({
    providers: [provideZoneChangeDetection()]
  });

  const editorElement = createCustomElement(AppComponent, { injector: app.injector });
  customElements.define('speedtest-editor', editorElement);
})();
