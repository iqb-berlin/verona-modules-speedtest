import { Injectable } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VeronaAPIService {
  sessionID: string | undefined;
  resourceURL: string | undefined;
  startCommand = new Subject<StartCommand>();
  pageNavCommand = new Subject<PageNavCommand>();

  private isStandalone = window === window.parent;

  constructor() {
    fromEvent(window, 'message')
      .subscribe((event: Event): void => {
        this.handleMessage((event as MessageEvent).data);
      });
  }

  private handleMessage(messageData: StartCommand | PageNavCommand): void {
    switch (messageData.type) {
      case 'vopStartCommand':
        this.sessionID = messageData.sessionID;
        this.startCommand.next(messageData as StartCommand);
        break;
      case 'vopPageNavigationCommand':
        this.pageNavCommand.next(messageData as PageNavCommand);
        break;
      default:
        console.warn('player: got message of unknown type: ', messageData);
    }
  }

  private sendMessage(message: ReadyNotification | StateChangeNotification | NavRequestNotification | FocusChangeNotification): void {
    // prevent posts in local (dev) mode
    if (!this.isStandalone) {
      window.parent.postMessage(message, '*');
    }
  }

  sendReady(): void {
    const metadata: string | null | undefined = document.getElementById('verona-metadata')?.textContent;
    this.sendMessage({
      type: 'vopReadyNotification',
      metadata: metadata ? JSON.parse(metadata) : {}
    });
  }

  sendNavRequest() {
    this.sendMessage({
      type: 'vopUnitNavigationRequestedNotification',
      sessionId: this.sessionID as string,
      target: 'next'
    });
  }

  sendState(pageCount: number, activePageIndex: number, responseData: Response[]): void {
    const validPages = VeronaAPIService.generateValidPages(pageCount);

    this.sendMessage({
      type: 'vopStateChangedNotification',
      sessionId: this.sessionID as string,
      timeStamp: String(Date.now()),
      unitState: {
        unitStateDataType: 'iqb-standard@1.0',
        presentationProgress: 'complete',
        responseProgress: responseData.length > 0 ? 'complete' : 'none',
        dataParts: responseData.length > 0 ? {
          [`responseData_Page${activePageIndex}`]: JSON.stringify(responseData),
          lastSeenPageIndex: JSON.stringify({
            id: 'lastSeenPageIndex',
            status: 'VALUE_CHANGED',
            value: activePageIndex.toString()
          })
        } : {}
      },
      playerState: {
        validPages,
        currentPage: (activePageIndex + 1).toString()
      }
    });
  }

  /* Creates an object with page indices as keys and values. The keys are incremented by one. */
  private static generateValidPages(pageCount: number): Record<string, string> {
    const validPages: Record<string, string> = {};
    Array.from(Array(pageCount).keys()).forEach(page => validPages[(page + 1).toString()] = (page + 1).toString());
    return validPages;
  }

  sendFocusChanged(isFocused: boolean): void {
    this.sendMessage({
      type: 'vopWindowFocusChangedNotification',
      timeStamp: String(Date.now()),
      hasFocus: isFocused
    });
  }
}

// Incoming
export interface StartCommand {
  type: 'vopStartCommand';
  sessionID: string;
  unitDefinition: string;
}

export interface PageNavCommand {
  type: 'vopPageNavigationCommand';
  sessionId: string;
  target: string;
}

// Outgoing
export interface ReadyNotification {
  type: 'vopReadyNotification';
  metadata: string;
}

export interface StateChangeNotification {
  type: 'vopStateChangedNotification';
  sessionId: string;
  timeStamp: string;
  unitState: UnitState;
  playerState: PlayerState;
  log?: LogEntry[];
}

interface UnitState {
  dataParts: Record<string, string>;
  presentationProgress: string;
  responseProgress: string;
  unitStateDataType: string;
}

interface Response {
  id: string;
  status: 'VALUE_CHANGED';
  value: number;
}

interface PlayerState {
  validPages: Record<string, string>;
  currentPage: string;
}

interface LogEntry {
  timeStamp: string;
  key: string;
  content: string;
}

export interface NavRequestNotification {
  type: 'vopUnitNavigationRequestedNotification';
  sessionId: string;
  target: string;
}

export interface FocusChangeNotification {
  type: 'vopWindowFocusChangedNotification';
  timeStamp: string;
  hasFocus: boolean;
}
