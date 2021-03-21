/* eslint-disable @typescript-eslint/no-non-null-assertion */
import dotenv from "dotenv";
dotenv.config();

export const env = {
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN as string,
  SLACK_SIGNING_SECRET: process.env.SIGNING_SECRET as string,
  SLACK_INCIDENT_BROADCAST_CHANNEL: process.env
    .INCIDENT_BROADCAST_CHANNEL as string,
  HTTP_PORT: process.env.HTTP_PORT as string
};
