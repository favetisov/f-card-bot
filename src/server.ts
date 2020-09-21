import { botCall } from './bot';
import { onmessage } from './index';

const allowedUpdates = [
  'callback_query',
  'channel_post',
  'chosen_inline_result',
  'edited_channel_post',
  'edited_message',
  'inline_query',
  'message',
  'pre_checkout_query',
  'shipping_query',
  'poll',
  'poll_answer',
];

/**
 * Minimal wrapper to main entry point in 'index.ts'
 * Can be used for local testing
 *  (you need to redirect public webhook calls to your machine - ngrok or ssh tunnel to public server might be helpful)
 *
 *  Example: ssh -N -R your_server:8443:localhost:8443 your_server
 *  also make sure that "GatewayPorts" set to "yes" in sshd config on your server
 *
 * Or you can deploy it somewhere and use as public webhook endpoint
 */
(async () => {
  const getUpdates = async (lastUpdateId?: number) => {
    console.log('asking for updates');

    const response = await botCall('getUpdates', {
      allowed_updates: allowedUpdates,
      timeout: 120,
      offset: lastUpdateId ? lastUpdateId + 1 : undefined,
    });

    lastUpdateId = response.result?.length ? response.result[response.result.length - 1].update_id : null;
    try {
      for (const update of response.result) {
        const res = { send: () => {} };
        const req = { body: update };
        console.time('onmessage');
        await onmessage(req, res);
        console.timeEnd('onmessage');
      }
    } catch (e) {
      console.error(e);
    }
    return getUpdates(lastUpdateId);
  };
  return getUpdates();
})();
