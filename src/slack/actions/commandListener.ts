import { App } from "@slack/bolt";
import canReportModal from "../views/can-report-modal";

import { env } from "../../env";

interface ChannelPayload {
  id: string;
  name: string;
}

export default function commandListener(app: App): void {
  const botToken = env.SLACK_BOT_TOKEN;
  const incidentResponders = ["UBMS9SGUC"];

  app.command(`/incident-declare`, async ({ command, ack }) => {
    ack();
    const todaysDate = new Date();
    app.client.conversations
      .create({
        token: botToken,
        name: `incd-${todaysDate.getFullYear()}-${todaysDate.getMonth() +
          1}-${todaysDate.getDate()}-${Math.floor(Math.random() * (999 - 1))}`
      })
      .then(channelCreateResult => {
        if (channelCreateResult.error) {
          console.error(channelCreateResult.error);
          return;
        }
        const channel = channelCreateResult.channel as ChannelPayload;
        incidentResponders.push(command.user_id);
        if (channel.id) {
          if (env.SLACK_INCIDENT_BROADCAST_CHANNEL) {
            app.client.chat.postMessage({
              token: botToken,
              text: `An incident has been declared. Follow along at <#${channel.id}>`,
              channel: env.SLACK_INCIDENT_BROADCAST_CHANNEL
            });
          }
          app.client.conversations.invite({
            token: botToken,
            channel: channel.id,
            users: incidentResponders.join(",")
          });
        }
      });
  });

  app.command(`/incident-can-report`, async ({ command, ack, say }) => {
    ack();
    if (!command.channel_name.startsWith("incd")) {
      say("Sorry, you should only do CAN reports in an incident channel!");
      return;
    }
    app.client.views
      .open({
        token: botToken,
        // eslint-disable-next-line @typescript-eslint/camelcase
        trigger_id: command.trigger_id,
        view: canReportModal.display(command.channel_id)
      })
      .catch(error => {
        console.error(JSON.stringify(error, null, 2));
      });
  });
}
