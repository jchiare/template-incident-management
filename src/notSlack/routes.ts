import { ExpressReceiver } from '@slack/bolt'
import { env } from '.././env'


const receiver = new ExpressReceiver({ signingSecret: env.SLACK_SIGNING_SECRET });

receiver.router.get('/secret-page', (_, res) => {
    // You're working with an express req and res now.
    res.send('yay!');
  });

export default receiver;  
