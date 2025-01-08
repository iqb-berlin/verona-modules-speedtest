import { Subject } from 'rxjs';
import { VariableInfo } from '@iqb/responses';
import { Unit } from 'common/interfaces/unit';

export class VeronaAPIService {
  static sessionID: string | undefined;
  static startCommand = new Subject<StartCommand>();
  static getDefinitionCommand = new Subject<GetDefinitionCommand>();

  static handleMessage(messageData: GetDefinitionCommand | StartCommand): void {
    if (messageData.type === 'voeStartCommand') {
      VeronaAPIService.sessionID = messageData.sessionId;
      VeronaAPIService.startCommand.next(messageData as StartCommand);
    }
  }

  private static sendMessage(message: Record<string, string | VariableInfo[]>): void {
    window.parent.postMessage(message, '*');
  }

  static sendReady(): void {
    const metadata: string | null | undefined = document.getElementById('verona-metadata')?.textContent;
    VeronaAPIService.sendMessage({
      type: 'voeReadyNotification',
      metadata: metadata ? JSON.parse(metadata) : {}
    });
  }

  static sendChange(unit: Unit, variableInfo: VariableInfo[]): void {
    VeronaAPIService.sendMessage({
      type: 'voeDefinitionChangedNotification',
      sessionId: VeronaAPIService.sessionID as string,
      timeStamp: String(Date.now()),
      unitDefinition: JSON.stringify(unit),
      unitDefinitionType: 'speedtest-unit-definition@1.0.0',
      variables: variableInfo
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
