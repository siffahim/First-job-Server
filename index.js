const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
require('dotenv').config();
const cors = require('cors');


//middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload())


//mongodb connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lyhqa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri);


async function run() {
    try {
        await client.connect();

        const database = client.db('Job_Task');
        const blogCollection = database.collection('Blogs');

        app.get('/blogs', async (req, res) => {
            const cursor = blogCollection.find({})
            const result = await cursor.toArray()
            res.json(result)
        })

        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const cursor = await blogCollection.findOne(query);
            res.json(cursor)
        })

        //post blog----------------------
        app.post('/blogs', async (req, res) => {
            const title = req.body.title;
            const country = req.body.country;
            const description = req.body.description;

            const pic = req.files.img;
            const picData = pic.data.toString('base64');
            const imgBuffer = Buffer.from(picData, 'base64');

            const info = {
                title,
                img: imgBuffer,
                country,
                description
            }

            const result = await blogCollection.insertOne(info);
            res.json(result)
        })

        //delete blog-----------------------
        app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogCollection.deleteOne(query);
            res.json(result)
        })

        app.put('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log('hitted', id)
            const pic = req.files.img;
            const picData = pic.data.toString('base64');
            const imgBuffer = Buffer.from(picData, 'base64');

            const updateBlog = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    title: updateBlog.title,
                    img: imgBuffer,
                    country: updateBlog.country,
                    description: updateBlog.description
                },
            };
            const result = await blogCollection.updateOne(query, updateDoc, options)
            res.json(result)
        })

    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('I m First Job Task Server')
})

app.listen(port, () => {
    console.log('Running server', port)
})