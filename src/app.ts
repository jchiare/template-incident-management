import { App, LogLevel } from "@slack/bolt";

import receiver from "./notSlack/routes";
import messageListener from "./slack/actions/messageListener";
import { initializeSlackCommands } from "./slack/slackController";
import viewListener from "./slack/actions/viewListener";

import { env } from "./env";
import { logger } from "./logger";

const botToken = env.SLACK_BOT_TOKEN;

const app = new App({
  signingSecret: env.SLACK_SIGNING_SECRET,
  token: botToken,
  logLevel: LogLevel.DEBUG,
  receiver
});

initializeSlackCommands(app);
messageListener(app);
viewListener(app);

(async (): Promise<void> => {
  // Start your app
  await app.start(+env.HTTP_PORT);
  logger.info(`Started incident response bot on port ${env.HTTP_PORT}`);
})();
