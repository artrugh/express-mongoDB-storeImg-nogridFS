
const express = require('express')
const fileUpload = require('express-fileupload')
const mongodb = require('mongodb');
const fs = require('fs')

const app = express()
const router = express.Router()
const mongoClient = mongodb.MongoClient
const binary = mongodb.Binary
const mongoose = require('mongoose');

// Schema
const Image = require("./imgModel");

mongoose.connect('mongodb://127.0.0.1:27017/imgtest', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

// this is a pending connection - we want a notification concerning our connection status

const db = mongoose.connection;

db.on("error", console.error);
db.on("open", () => {
    console.log("Database connection established...");
});

router.get("/", (req, res) => {
    res.sendFile('./index.html', { root: __dirname })
})

router.get("/download", (req, res) => {
    getFiles(res)
})

app.use(fileUpload())

const insertFile = async (req, res) => {

    let newfile = { name: req.body.name, file: binary(req.files.uploadedFile.data) }

    const { name, file } = newfile
    console.log(name, file);
    
    const newImage = new Image({
        img: {
            name: name,
            file: file
        }
    })

    await newImage.save();
    res.status(200).json(newImage);
    console.log("Inserted photo");
    
}

const getFiles = (res) => {

    mongoClient.connect('mongodb://localhost:27017',

        {
            useNewUrlParser: true
        },
        async (err, client) => {
            if (err) {
                return err
            }
            else {

                let db = client.db('uploadDB')
                let collection = db.collection('files');

                try {
                    collection.find({}).toArray((err, doc) => {
                        if (err) {
                            console.log('err in finding doc:', err)
                        }
                        else {
                            let buffer = doc[0].file.buffer
                            fs.writeFileSync('uploadedImage.jpg', buffer)
                        }
                    })
                } catch (err) {
                    console.log('Error while inserting:', err)
                }
                await client.close()
                await res.redirect('/')

            }

        })
}

router.post("/upload", insertFile);

app.use("/", router)

app.listen(3000, () => console.log('Started on 3000 port'))

