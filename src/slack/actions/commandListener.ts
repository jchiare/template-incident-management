import { App } from "@slack/bolt";
import { WebAPICallResult } from "@slack/web-api";

import canReportModal from "../views/can-report-modal";
import initialIncidentResponseMessage from "../views/initial-ir-channel-message";

import { logger } from "../../logger";
import { env } from "../../env";

interface ChannelPayload {
  id: string;
  name: string;
}

interface ChatPostMessagePayload extends WebAPICallResult {
  channel: string;
  ts: string;
  message: object;
}

const WHITELISTED_USERS = ["U01SM6B4B8B", "UBMS9SGUC"];

export default function commandListener(app: App): void {
  const botToken = env.SLACK_BOT_TOKEN;
  const incidentResponders = ["UBMS9SGUC"];

  app.command(`/incident-declare`, async ({ command, ack, respond }) => {
    ack();
    if (!WHITELISTED_USERS.includes(command.user_id)) {
      respond({
        // eslint-disable-next-line @typescript-eslint/camelcase
        response_type: "ephemeral",
        text: `You don't have permission to start an incident response`
      });
      return;
    }
    const todaysDate = new Date();
    const channelCreateResult = await app.client.conversations.create({
      token: botToken,
      name: `incd-${todaysDate.getDate()}-${todaysDate.getMonth() +
        1}-${todaysDate.getFullYear()}-${Math.floor(Math.random() * (999 - 1))}`
    });

    if (channelCreateResult.error) {
      logger.error(channelCreateResult.error);
      return;
    }

    const channel = channelCreateResult.channel as ChannelPayload;
    incidentResponders.push(command.user_id);
    if (channel.id) {
      if (env.SLACK_INCIDENT_BROADCAST_CHANNEL) {
        app.client.chat.postMessage({
          token: botToken,
          text: `An incident has been declared by <@${command.user_id}>. Follow along at <#${channel.id}>`,
          channel: env.SLACK_INCIDENT_BROADCAST_CHANNEL
        });
      }
      await app.client.conversations.invite({
        token: botToken,
        channel: channel.id,
        users: incidentResponders.join(",")
      });

      const messageResponse = (await app.client.chat.postMessage({
        token: botToken,
        channel: channel.id,
        text: "Initial Report",
        blocks: initialIncidentResponseMessage.blocks(command.user_id)
      })) as ChatPostMessagePayload;

      app.client.pins.add({
        token: botToken,
        channel: channel.id,
        timestamp: messageResponse.ts
      });
    }
  });

  app.command(`/incident-can-report`, async ({ command, ack, say }) => {
    ack();
    if (!command.channel_name.startsWith("incd")) {
      say("Sorry, you should only do CAN reports in an incident channel!");
      return;
    }
    logger.info(JSON.stringify(command));
    app.client.views
      .open({
        token: botToken,
        // eslint-disable-next-line @typescript-eslint/camelcase
        trigger_id: command.trigger_id,
        view: canReportModal.display(command.channel_id)
      })
      .catch(error => {
        logger.error(JSON.stringify(error, null, 2));
      });
  });
}
