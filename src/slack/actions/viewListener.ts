import { App } from "@slack/bolt";
import { WebAPICallResult } from "@slack/web-api";

import { env } from "../../env";
import { logger } from "../../logger";

import canReportOutput from "../views/can-report-output";

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

export default function viewListener(app: App): void {
  const botToken = env.SLACK_BOT_TOKEN;

  app.view(
    // eslint-disable-next-line @typescript-eslint/camelcase
    { callback_id: "can-report-modal", type: "view_submission" },
    async ({ ack, body }) => {
      ack();
      const responses = (body.view.state as ModalStatePayload).values;
      logger.info(JSON.stringify(responses));
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
}
