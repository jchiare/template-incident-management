import { App } from "@slack/bolt";

import incidentDeclareCommandActions from "./actions/commands/incidentDeclare";

export function initializeSlackCommands(app: App): void {
  app.command(`/incident-declare`, async ({ command, ack, respond }) => {
    ack();

    incidentDeclareCommandActions(app, command, respond);
  });
}
