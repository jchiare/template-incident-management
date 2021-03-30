import { SayFn } from "@slack/bolt";
import { WebAPICallResult } from "@slack/web-api";

export default class MessageHandler {
  public static async basicReply(
    message: any, // see https://github.com/slackapi/bolt-js/issues/826 why this is necessary
    say: SayFn
  ): Promise<WebAPICallResult> {
    return await say(`Hello, <@${message.user}>`);
  }
}