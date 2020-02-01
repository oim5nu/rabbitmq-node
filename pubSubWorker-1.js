const amqp = require('amqplib');
const CONN_URL = "amqp://izlpilde:yQSNkComDQHyW6Up-tTrfvTOjlRKTc6a@vulture.rmq.cloudamqp.com/izlpilde";


async function worker() {
    let conn = null;
    let channel = null;
    try {
        conn = await amqp.connect(CONN_URL);
        process.once('SIGINT', function() { conn.close();});
        channel = await conn.createChannel();
        const exchangeOk = await channel.assertExchange('logs', 'fanout', { durable: false });

        if(!exchangeOk) { throw new Error('AssertExchange Error'); }
        const queueOk = await channel.assertQueue('', { durable: true });
        if(!queueOk) { throw new Error('AssertQueue Error!'); }

        const queueBinded = await channel.bindQueue(queueOk.queue, 'logs', '');

        if(!queueBinded) { throw new Error('BindQueue Error')};

        const result = await channel.consume(
            queueOk.queue, 
            doWork, 
            // false, message go back to the queue if worker crash
            { noAct: true } // true, queue will delete message after read
        );
        console.log(" [*] Waiting for messages. To exit press CTRL+C");
        return result;

    } catch(error) {
        console.log('error', error);
    } finally {
        //
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
