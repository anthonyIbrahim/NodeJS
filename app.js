const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const url = require('url');
const cookieParser = require('cookie-parser');
const path = require('path');
const ejs = require('ejs');

app.use(cookieParser());
app.set('view engine', 'ejs');

(async() => {


    const client = await MongoClient.connect(
        'mongodb+srv://student:student@clusterforproject-wvwzh.mongodb.net/test?retryWrites=true&w=majority', { useUnifiedTopology: true },
    );
    const db = client.db('nodeFinal');
    const vehiclesCollection = db.collection('vehicles');
    const sensorsWheelsCollection = db.collection('sensors_wheels');
    const echoCollection = db.collection('echo');
    const lineCollection = db.collection('line');
    const otherCollection = db.collection('other');



    app.listen(3000, function() {
        console.log('listening on port 3000');
    });

    app.get('/register', async(req, res) => {
        const query = url.parse(req.url, true).query;
        obj = {
            USER: query.name,
            WIDTH: query.width,
            Time: parseInt(query.time),
            timestamp: Date.now()
        };

        let result = await vehiclesCollection.insertOne(obj);

        res.cookie("USER", query.name);
        console.log(res.cookie);
        res.send('cookie is set');

    });


    app.get('/wheels', async(req, res) => {

        const query = url.parse(req.url, true).query;

        //clean that shit
        query.left = parseInt(query.left);
        query.right = parseInt(query.right);
        query.time = parseInt(query.time);
        query.USER = req.cookies.USER;
        query.timestamp = Date.now();

        let result = await sensorsWheelsCollection.insertOne(query);

        console.log(req.cookies);
        res.send('');
    });

    app.get('/echo', async(req, res) => {
        const query = url.parse(req.url, true).query;

        const obj = {
            dist: parseFloat(query.dist),
            time: parseInt(query.time),
            Cookie: req.cookies.USER,
            timestamp: Date.now(),
            USER: query.name
        };
        let result = await echoCollection.insertOne(obj);
        res.send('');
    });

    app.get('/line', async(req, res) => {
        const query = url.parse(req.url, true).query;

        const lines = JSON.parse(JSON.stringify(query));

        const obj = {
            USER: req.cookies.USER,
            timestamp: Date.now()
        };
        const secondObj = Object.assign(lines, obj);
        let result = await lineCollection.insertOne(secondObj);
        res.send('');
    });

    app.get('/other', async(req, res) => {
        const query = url.parse(req.url, true).query;
        const q = JSON.parse(JSON.stringify(query));

        const obj = {
            USER: req.cookies.USER,
            timestamp: Date.now()
        };
        const secondaryObject = Object.assign(q, obj);

        let result = await otherCollection.insertOne(secondaryObject);
        res.send('');
    });

    app.get('/end', async(req, res) => {
        const query = url.parse(req.url, true).query;
        res.clearCookie('USER');
        res.send('cookie cleared');
    });


    app.get('/', async(req, res) => {
        var vehicleCollect = [];
        var wheelsCollect = [];
        var echoCollect = [];
        var lineCollect = [];
        var otherCollect = [];
        await db.collection('vehicles').find().toArray()
            .then(function(results) {
                vehicleCollect = results;
            }).catch(function(results) {
                console.log();
            });

        await db.collection('sensors_wheels').find().toArray()
            .then(function(results) {
                wheelsCollect = results;
            }).catch(function(results) {
                console.log();
            });

        await db.collection('echo').find().toArray()
            .then(function(results) {
                echoCollect = results;
            }).catch(function(results) {
                console.log();
            });

        await db.collection('line').find().toArray()
            .then(function(results) {
                lineCollect = results;
            }).catch(function(results) {
                console.log();
            });

        await db.collection('other').find().toArray()
            .then(function(results) {
                otherCollect = results;
                console.log(results);
            }).catch(function(results) {
                console.log();
            });
        console.log(otherCollect);
        res.render('index.ejs', {
            other: otherCollect,
            sensors_wheels: wheelsCollect,
            echo: echoCollect,
            line: lineCollect,
            vehicles: vehicleCollect
        });

    });



})();