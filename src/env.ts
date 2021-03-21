/* eslint-disable @typescript-eslint/no-non-null-assertion */
import dotenv from 'dotenv';
dotenv.config();

export const env = {
    SLACK_BOT_TOKEN: <string> process.env.SLACK_BOT_TOKEN,
    SLACK_SIGNING_SECRET:  <string> process.env.SIGNING_SECRET,
    SLACK_INCIDENT_BROADCAST_CHANNEL: <string> process.env.INCIDENT_BROADCAST_CHANNEL,
    HTTP_PORT: +<string> process.env.HTTP_PORT,
};  