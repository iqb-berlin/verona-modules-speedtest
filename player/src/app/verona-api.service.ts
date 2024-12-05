import { Subject } from 'rxjs';

export class VeronaAPIService {
  private static sessionID: string | undefined;
  static startCommand = new Subject<StartCommand>();
  static pageNavCommand = new Subject<PageNavCommand>();

  static handleMessage(messageData: StartCommand | PageNavCommand): void {
    switch (messageData.type) {
      case 'vopStartCommand':
        VeronaAPIService.sessionID = messageData.sessionID;
        VeronaAPIService.startCommand.next(messageData as StartCommand);
        break;
      case 'vopPageNavigationCommand':
        VeronaAPIService.pageNavCommand.next(messageData as PageNavCommand);
        break;
      // no default
    }
  }

  private static sendMessage(message: ReadyNotification | StateChangeNotification | NavRequestNotification | FocusChangeNotification): void {
    window.parent.postMessage(message, '*');
  }

  static sendReady(): void {
    const metadata: string | null | undefined = document.getElementById('verona-metadata')?.textContent;
    VeronaAPIService.sendMessage({
      type: 'vopReadyNotification',
      metadata: metadata ? JSON.parse(metadata) : {}
    });
  }

  static sendNavRequest() {
    VeronaAPIService.sendMessage({
      type: 'vopUnitNavigationRequestedNotification',
      sessionId: VeronaAPIService.sessionID as string,
      target: 'next'
    });
  }

  static sendState(pageCount: number, activePageIndex: number, responseData: Response[]): void {
    const validPages = VeronaAPIService.generateValidPages(pageCount);

    VeronaAPIService.sendMessage({
      type: 'vopStateChangedNotification',
      sessionId: VeronaAPIService.sessionID as string,
      timeStamp: String(Date.now()),
      unitState: {
        unitStateDataType: 'iqb-standard@1.0',
        presentationProgress: 'complete',
        responseProgress: responseData.length > 0 ? 'complete' : 'none',
        dataParts: responseData.length > 0 ? {
          [`responseData_Page${activePageIndex}`]: JSON.stringify(responseData),
          lastSeenPageIndex: JSON.stringify([{
            id: 'lastSeenPageIndex',
            status: 'VALUE_CHANGED',
            value: activePageIndex.toString()
          }])
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

  static sendFocusChanged(isFocused: boolean): void {
    VeronaAPIService.sendMessage({
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
  unitState?: {
    dataParts: Record<string, string>;
  }
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
