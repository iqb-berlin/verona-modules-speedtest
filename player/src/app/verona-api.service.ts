import { Subject } from 'rxjs';

export class VeronaAPIService {
  private static sessionID: string | undefined;
  static startCommand = new Subject<StartCommand>();

  static handleMessage(messageData: StartCommand): void {
    switch (messageData.type) {
      case 'vopStartCommand':
        VeronaAPIService.sessionID = messageData.sessionId;
        VeronaAPIService.startCommand.next(messageData as StartCommand);
        break;
      // no default
    }
  }

  private static sendMessage(
    message: ReadyNotification | StateChangeNotification | NavRequestNotification | FocusChangeNotification): void {
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

  static sendState(responseData: Record<string, Response[]>): void {
    VeronaAPIService.sendMessage({
      type: 'vopStateChangedNotification',
      sessionId: VeronaAPIService.sessionID as string,
      timeStamp: String(Date.now()),
      unitState: {
        unitStateDataType: 'iqb-standard@1.0',
        presentationProgress: 'complete',
        responseProgress: Object.keys(responseData).length > 0 ? 'complete' : 'none',
        dataParts: VeronaAPIService.stringifyAllValues(responseData)
      }
    });
  }

  private static stringifyAllValues(responseData: Record<string, Response[]>): Record<string, string> {
    return Object.entries(responseData).reduce((acc: Record<string, string>, [key, value]) => {
      acc[key] = JSON.stringify(value);
      return acc;
    }, {});
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
  sessionId: string;
  unitDefinition: string;
  unitState?: {
    dataParts: Record<string, string>;
  }
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
  log?: LogEntry[];
}

interface UnitState {
  dataParts: Record<string, string>;
  presentationProgress: string;
  responseProgress: string;
  unitStateDataType: string;
}

export interface Response {
  id: string;
  status: 'VALUE_CHANGED' | 'CODING_COMPLETE';
  value: number;
  subform?: string;
  code?: number;
  score?: number;
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
