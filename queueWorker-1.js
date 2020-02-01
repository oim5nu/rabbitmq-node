const amqp = require('amqplib');
const CONN_URL = process.env.AMQP_URL;



async function worker() {
    const queueName = 'user-messages';
    let conn = null;
    let channel = null;
    try {
        conn = await amqp.connect(CONN_URL);
        process.once('SIGINT', function() { conn.close();});
        channel = await conn.createChannel();
        const ok = await channel.assertQueue(queueName, { durable: true });
        if(ok) {
            await channel.prefetch(1);
            const result = channel.consume(
                queueName, 
                doWork, 
                // false, message go back to the queue if worker crash
                { noAct: true } // true, queue will delete message after read
            );
            console.log(" [*] Waiting for messages. To exit press CTRL+C");
            return result;
        }
        return ok;
    } catch(error) {
        console.log('error', error);
    }

    function doWork(msg) {
        const body = msg.content.toString();
        const secs = body.split('.').length - 1;
        console.log(" [X] Task takes %d seconds", secs);
        setTimeout(function() {
            console.log(" [X] Received :'%s' ...Done", body);
            channel.ack(msg);
        }, secs * 1000);
    }

}

worker();

