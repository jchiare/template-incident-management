import { App } from "@slack/bolt";

interface MessageInterface {
  message?: any;
  say?: any;
}

export default function messageListener(app: App): void {
  app.message("hey", async ({ message, say }: MessageInterface) => {
    await say(`Hello, <@${message.user}>`);
  });
}
