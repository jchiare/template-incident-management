import { App, LogLevel } from "@slack/bolt";
import { WebAPICallResult } from "@slack/web-api";

import canReportOutput from "./slack/views/can-report-output";
import receiver from "./notSlack/routes";
import messageListener from "./slack/actions/messageListener";
import commandListener from "./slack/actions/commandListener";

import { env } from "./env";

const botToken = env.SLACK_BOT_TOKEN;

const app = new App({
  signingSecret: env.SLACK_SIGNING_SECRET,
  token: botToken,
  logLevel: LogLevel.DEBUG,
  receiver
});

interface ModalStatePayload {
  values: {
    [key: string]: {
      [key: string]: {
        type: string;
        value?: string;
        selected_option?: {
          value: string;
        };
      };
    };
  };
}

interface ChatPostMessagePayload extends WebAPICallResult {
  channel: string;
  ts: string;
  message: object;
}

messageListener(app);

commandListener(app);

app.view(
  // eslint-disable-next-line @typescript-eslint/camelcase
  { callback_id: "can-report-modal", type: "view_submission" },
  async ({ ack, body }) => {
    ack();
    const responses = (body.view.state as ModalStatePayload).values;
    const canReport = (await app.client.chat.postMessage({
      token: botToken,
      channel: body.view.private_metadata,
      text: "CAN Report",
      blocks: canReportOutput.blocks(
        body.user.id,
        responses["conditions"]["conditions"].value!,
        responses["actions"]["actions"].value!,
        responses["needs"]["needs"].value!,
        responses["next-report"]["next-report"].selected_option!.value,
        body.view.private_metadata
      )
    })) as ChatPostMessagePayload;

    app.client.pins.add({
      token: botToken,
      channel: canReport.channel,
      timestamp: canReport.ts
    });
  }
);

(async (): Promise<void> => {
  // Start your app
  await app.start(+env.HTTP_PORT);
  console.log("IncidentBot is ready and waiting...");
})();
