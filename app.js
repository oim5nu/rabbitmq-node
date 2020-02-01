import express from 'express';
import bodyParser from 'body-parser';
import users from './routes/users';
import {MongoClient} from 'mongodb';
import {clientApiKeyValidation} from './common/authUtils';

//const CONN_URL = 'mongodb://localhost:27017';
const CONN_URL = process.env.MONGO_URL;

console.log('CONN_URL', CONN_URL);
let mongoClient = null;

MongoClient.connect(CONN_URL,{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}, function (err, client) {
    mongoClient = client;
});

let app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use((req,res,next)=>{
    req.db = mongoClient.db('test');
    next();
});

app.use(clientApiKeyValidation);

app.get('/',(req,res,next)=>{
    res.status(200).send({
        status:true,
        response:'Hello World!'
    });
});

app.use('/users',users);

app.listen(30006,()=>{
    console.log(' ********** : running on 30006');
})

process.on('exit', (code) => {
    mongoClient.close();
    console.log(`About to exit with code: ${code}`);
});


process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    process.exit();
});


module.exports = app;