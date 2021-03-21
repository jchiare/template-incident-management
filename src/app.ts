import { App, LogLevel, ExpressReceiver } from '@slack/bolt'

import canReportModal from './slack/views/can-report-modal';
import canReportOutput from './slack/views/can-report-output';

import { WebAPICallResult } from '@slack/web-api'

import { env } from './env'


const receiver = new ExpressReceiver({ signingSecret: env.SLACK_SIGNING_SECRET });
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
                type: string,
                value?: string,
                selected_option?: {
                    value: string
                }
            }
        }
    }
}

interface ChannelPayload {
    id: string,
    name: string
}

interface ChatPostMessagePayload extends WebAPICallResult {
    channel: string,
    ts: string,
    message: object
}

const incidentResponders = [
    "UBMS9SGUC"
]

interface MessageInterface {
    message?:any;
    say?:any;
}

app.message('hey', async ({ message, say }:MessageInterface) => {
    await say(`Hello, <@${message.user}>`);
});

app.command(`/incident-declare`, async ({ command, ack }) => {
    ack();
    const todaysDate = new Date();
    app.client.conversations.create({
        token: botToken,
        name: `incd-${todaysDate.getFullYear()}-${todaysDate.getMonth() + 1}-${todaysDate.getDate()}-${Math.floor(Math.random() * (999 - 1))}`
    }).then(channelCreateResult => {
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
                users: incidentResponders.join(',')
            });
        }
    });
});

app.command(`/incident-can-report`, async ({ command, ack, say }) => {
    ack();
    if (!command.channel_name.startsWith('incd')) {
        say('Sorry, you should only do CAN reports in an incident channel!');
        return;
    }
    app.client.views.open({
        token: botToken,
        // eslint-disable-next-line @typescript-eslint/camelcase
        trigger_id: command.trigger_id,
        view: canReportModal.display(command.channel_id),
    }).catch(error => {
        console.error(JSON.stringify(error, null, 2));
    });
});

// eslint-disable-next-line @typescript-eslint/camelcase
app.view({ callback_id: 'can-report-modal', type: 'view_submission' }, async ({ ack, body }) => {
    ack();
    const responses = (body.view.state as ModalStatePayload).values;
    const canReport = await app.client.chat.postMessage({
        token: botToken,
        channel: body.view.private_metadata,
        text: 'CAN Report',
        blocks: canReportOutput.blocks(
            body.user.id,
            responses['conditions']['conditions'].value!,
            responses['actions']['actions'].value!,
            responses['needs']['needs'].value!,
            responses['next-report']['next-report'].selected_option!.value,
            body.view.private_metadata
        )
    }) as ChatPostMessagePayload;

    app.client.pins.add({
        token: botToken,
        channel: canReport.channel,
        timestamp: canReport.ts
    });
});

receiver.router.get('/secret-page', (_, res) => {
    // You're working with an express req and res now.
    res.send('yay!');
  });

(async (): Promise<void> => {
    // Start your app
    await app.start(+env.HTTP_PORT);
    console.log('IncidentBot is ready and waiting...');
})();