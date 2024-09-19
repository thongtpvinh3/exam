const express = require('express')
const path = require('path')
const shuffleArray = require('./common2')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoDbUtils = require('./mongoDbUtils')
const {MongoClient} = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3001

app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname)))
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

async function run(func) {
    try {
        await mongoDbUtils.connect('question-db')
        const questionCollection = mongoDbUtils.getCollection('question')
        await func(questionCollection)
    } catch (err) {
        console.error('Error:', err)
    } finally {
        await mongoDbUtils.closeConnection()
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/exam', (req, res) => {
    res.sendFile(path.join(__dirname, 'exam.html'))
})

app.get('/question-form', (req, res) => {
    res.sendFile(path.join(__dirname, 'question-form.html'))
})

// API Get All Questions
app.get('/api/questions', async (req, res) => {
    await sleep(Math.floor(Math.random() * (2000 - 1500 + 1)) + 1500)

    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms)
        })
    }

    let allQuestions = []
    const getAllQuestions = async (collection) => {
        allQuestions = await collection.find({}).toArray()
    }

    run(getAllQuestions).then(_r => {
        let sortedQuestions = allQuestions.sort((a, b) => b.id - a.id)
        res.json({
            message: 'success',
            code: 200,
            totalRecords: sortedQuestions.length,
            data: sortedQuestions
        })
    })
})

// API Insert New Question
app.post('/api/question-form', (req, res) => {
    const insertQuestion = async (collection) => {
        let data = JSON.parse(req.body.data)
        data['wrongCount'] = 0
        await collection.insertOne(data)
    }
    run(insertQuestion).then(r => {
        res.json({
            message: 'Success',
            code: 200,
            data: r
        })
    })
})

// API Get Random Question
app.get('/api/questions/random', (req, res) => {
    let allQuestions = []
    const getAllQuestions = async (collection) => {
        allQuestions = await collection.find({}).toArray()
    }

    run(getAllQuestions).then(_r => {
        let shuffledQuestion = shuffleArray(allQuestions)
        res.json({
            message: 'Success',
            code: 200,
            data: shuffledQuestion.slice(0, 30)
        })
    })
})

// API get Question by ID
app.get('/api/questions/:id', (req, res) => {
    let questionObj
    const getQuestionById = async (collection) => {
        questionObj = await collection.findOne({'id': Number(req.params.id)})
    }
    run(getQuestionById).then(_r => {
        res.json({
            message: 'Success',
            code: 200,
            data: questionObj
        })
    })
})

// API Update question by ID
app.post('/api/question-form/:id', async (req, res) => {
    const client = new MongoClient('mongodb+srv://thongtpvinh3:RBZkPEdg7Rzgm5.@cluster0.9b2vw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

    try {
        await client.connect()

        const db = client.db('question-db')
        const collection = db.collection('question')

        let data = req.body.data
        let updateQuestion = JSON.parse(data)

        const filter = {id: Number(req.params.id)}
        const updateOperation = {$set: updateQuestion}

        const result = await collection.updateOne(filter, updateOperation);

        if (result.modifiedCount > 0) {
            res.json({
                message: 'Success',
                code: 200
            })
        } else {
            res.json({
                message: 'Failed',
                code: 400
            })
        }

    } catch (err) {
        console.error('Error:', err)
    } finally {
        await client.close();
    }

})

// API Delete question by ID
app.post('/api/question-form/delete/:id', (req, res) => {
    const deleteQuestionById = async (collection) => {
        const result = await collection.deleteOne({'id': Number(req.params.id)})

        if (result.deletedCount === 1) {
            res.json({
                message: 'Success',
                code: 200
            })
        } else {
            res.json({
                message: 'Failed',
                code: 400
            })
        }
    }
    run(deleteQuestionById).then(_ => {
    })
})

app.post('/api/submit-exam', async (req, res) => {
    const client = new MongoClient('mongodb+srv://thongtpvinh3:RBZkPEdg7Rzgm5.@cluster0.9b2vw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

    try {
        await client.connect()

        const db = client.db('question-db')
        const collection = db.collection('question')

        let answerData = req.body
        let answerDataMap = new Map()
        for (const key in answerData) {
            if (answerData.hasOwnProperty(key)) {
                answerDataMap.set(key, answerData[key])
            }
        }
        const maxPoint = 10
        let totalQuestion = 0
        let totalTrue = 0
        let responseData = []
        let questionInAnswer = Array.from(answerDataMap.keys()).map(k => Number(k))
        let wrongCountUpdateList = []

        const qListIn = await collection.find({id: {$in: questionInAnswer}}).toArray()

        for (let [key, value] of answerDataMap) {
            totalQuestion++
            const checkResult = qListIn.filter(q => q.id === Number(key)).map(q => {
                const check = q.trueAnswer === value
                if (check) {
                    totalTrue++
                } else {
                    wrongCountUpdateList.push(q.id)
                }
                return {
                    id: q.id,
                    check: check,
                    choose: value,
                    correctAnswer: q.trueAnswer
                }
            })[0]
            responseData.push(checkResult)
        }
        const lastPoint = (totalTrue / totalQuestion * maxPoint).toFixed(2)
        const filter = {id: {$in: wrongCountUpdateList}}
        const update = {
            $inc: {wrongCount: 1}
        }
        await collection.updateMany(filter, update)
        res.json({
            message: 'Success',
            code: 200,
            point: lastPoint,
            data: responseData
        })
    } catch (err) {
        console.error('Error:', err)
    } finally {
        await client.close();
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})