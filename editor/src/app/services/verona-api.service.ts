import { Injectable } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { VariableInfo } from '@iqb/responses';

@Injectable({
  providedIn: 'root'
})
export class VeronaAPIService {
  sessionID: string | undefined;
  resourceURL: string | undefined;
  // private _voeStartCommand = new Subject<VoeStartCommand>();
  startCommand = new Subject<StartCommand>();
  // private _voeGetDefinitionRequest = new Subject<VoeGetDefinitionRequest>();
  getDefinitionCommand = new Subject<GetDefinitionCommand>();

  private isStandalone = window === window.parent;

  constructor() {
    fromEvent(window, 'message')
      .subscribe((event: Event): void => {
        this.handleMessage((event as MessageEvent).data);
      });
  }

  private handleMessage(messageData: GetDefinitionCommand | StartCommand): void {
    switch (messageData.type) {
      case 'voeStartCommand':
        this.sessionID = messageData.sessionId;
        this.resourceURL = (messageData as StartCommand).editorConfig.directDownloadUrl;
        this.startCommand.next(messageData as StartCommand);
        break;
      case 'voeGetDefinitionRequest': // No longer part of the API. Kept in for compatibility.
        this.getDefinitionCommand.next(messageData);
        break;
      default:
        console.warn(`editor: got message of unknown type ${messageData}`);
    }
  }

  getResourceURL(): string {
    return this.resourceURL || 'assets';
  }

  private send(message: Record<string, string | VariableInfo[]>): void {
    // prevent posts in local (dev) mode
    if (!this.isStandalone) {
      window.parent.postMessage(message, '*');
    } else {
      // console.log(`player: ${message.type}`);
    }
  }

  sendReady(): void {
    const metadata: string | null | undefined = document.getElementById('verona-metadata')?.textContent;
    this.send({
      type: 'voeReadyNotification',
      metadata: metadata ? JSON.parse(metadata) : {}
    });
  }

  sendVoeDefinitionChangedNotification(unit: any): void {
    this.send({
      type: 'voeDefinitionChangedNotification',
      sessionId: this.sessionID as string,
      timeStamp: String(Date.now()),
      unitDefinition: JSON.stringify(unit)
    });
  }
}

export interface StartCommand extends MessageEvent {
  sessionId: string,
  unitDefinition: string,
  unitDefinitionType: string,
  editorConfig: {
    directDownloadUrl: string
  }
}

export interface GetDefinitionCommand extends MessageEvent {
  sessionId: string
}
