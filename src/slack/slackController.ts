import { App, SlackEventMiddlewareArgs } from "@slack/bolt";

import incidentDeclareCommandActions from "./actions/commands/incidentDeclare";
import MessageHandler from "./actions/messages/messageListener";

export function initializeSlackCommands(app: App): void {
  app.command(`/incident-declare`, async ({ command, ack, respond }) => {
    ack();

    incidentDeclareCommandActions(app, command, respond);
  });
}

export function initializeSlackMessages(app: App): void {
  app.message("heya", async (args: SlackEventMiddlewareArgs<"message">) => {
    MessageHandler.basicReply(args.message, args.say);
  });
}
