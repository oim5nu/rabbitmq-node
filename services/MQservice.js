import amqp from 'amqplib';

const CONN_URL = process.env.AMQP_URL;

let conn = null;
let channel = null;
export const publishToQueue = async (queueName, data) => {

   try {
      conn = await amqp.connect(CONN_URL);
      channel = await conn.createChannel();
      const ok = await channel.assertQueue(queueName, { durable: true });
      console.log('ok', ok);
      if(ok) {
         const result = await channel.sendToQueue(queueName, Buffer.from(data), { persistent: true });  
         console.log('result', result);
      }
   } catch(error) {
      console.log(error);
      throw error;
   } finally {
      return channel.close();
   }
}

export const publishToExchange = async (data) => {
   try {
      const ex = 'logs';
      conn = await amqp.connect(CONN_URL);
      channel = await conn.createChannel();
      const ok = await channel.assertExchange(ex, 'fanout', { durable: false });

      if(ok) {
         channel.publish(ex, '', Buffer.from(data));
      }

   }catch(error) {
      console.log(error);
      throw error;
   } finally {
      return channel.close();
   }
}

process.on('exit', (code) => {
   if (channel) channel.close();
   console.log(`Closing rabbitmq channel`);
});
