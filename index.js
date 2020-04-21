
const express = require('express')
const fileUpload = require('express-fileupload')
const mongodb = require('mongodb')
const fs = require('fs')

const app = express()
const router = express.Router()
const mongoClient = mongodb.MongoClient
const binary = mongodb.Binary

router.get("/", (req, res) => {
    res.sendFile('./index.html', { root: __dirname })
})

router.get("/download", (req, res) => {
    getFiles(res)
})

app.use(fileUpload())

const insertFile = (req, res) => {

    let file = { name: req.body.name, file: binary(req.files.uploadedFile.data) }

    mongoClient.connect('mongodb://localhost:27017',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        async (err, client) => {
            if (err) {
                return err
            }
            else {
                let db = client.db('uploadDB')
                let collection = db.collection('files')
                try {
                    await collection.insertOne(file)
                    console.log('File Inserted')
                }
                catch (err) {
                    console.log('Error while inserting:', err)
                }
                await client.close()
                await res.redirect('/')
            }

        })
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

app.listen(4000, () => console.log('Started on 4000 port'))