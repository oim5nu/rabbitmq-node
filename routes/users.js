import {Router} from 'express';
let router = Router();
import {getUserDetails} from '../services/UserService';
import {publishToQueue, publishToExchange} from '../services/MQservice';

router.post('/hello',async (req,res)=>{
    let uname = req.body.username;
    let userDetails = await getUserDetails(req.db,uname)
    res.status(200).send({
        status:true,
        response:userDetails
    });
});


router.post('/message',async(req, res, next)=>{
    let { queueName, type, payload } = req.body;
    //console.log('queueName, payload', queueName, payload);
    const newPayload = payload + ` (${(new Date()).toJSON()})`;
    try {
        if( type === 'Queue') {
            await publishToQueue(queueName, newPayload);
        } else if (type === 'Pub/Sub') {
            await publishToExchange(newPayload);
        } else {
            return next(new Error('Unknown type! Should be Queue or Pub/Sub'));
        }
    } catch(error) {
        return next(error)
    }
    // res.statusCode = 200;
    // res.data = {"message-sent":true};
    res.status(200).json({"message-sent":true, "payload": newPayload});
    next();
  });


export default router;