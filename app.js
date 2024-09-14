const express = require('express')
const path = require('path')
const shuffleArray = require('./common2')
const fs = require('fs')
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
    await sleep(Math.floor(Math.random() * (1000 - 500 + 1)) + 500)

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
        let sortedQuestions = allQuestions.sort((a, b) => b.id - a.id).map(q => ({id: q.id, content: q.question}))
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
        await collection.insertOne(JSON.parse(req.body.data))
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
            data: shuffledQuestion.slice(0, 5)
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

app.post('/api/question-form/:id', async (req, res) => {
    const client = new MongoClient('mongodb+srv://thongtpvinh3:RBZkPEdg7Rzgm5.@cluster0.9b2vw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

    try {
        await client.connect()

        const db = client.db('question-db')
        const collection = db.collection('question')

        let data = req.body.data
        let updateQuestion = JSON.parse(data)

        // Update document
        const filter = {id: Number(req.params.id)}
        const updateOperation = {$set: updateQuestion}

        const result = await collection.updateOne(filter, updateOperation);
        console.log('Document updated:', result.modifiedCount > 0 ? 'Success' : 'No document matched the filter')

        res.json({
            message: 'Success',
            code: 200
        })

    } catch (err) {
        console.error('Error:', err)
    } finally {
        await client.close();
    }

})

app.post('/api/question-form/delete/:id', (req, res) => {
    deleteQuestion(Number(req.params.id))
    res.json({
        message: 'Success',
        code: 200
    })
})

app.post('/api/submit-exam', (req, res) => {
    let answerData = req.body
    const examResult = getExamResult(answerData)
    res.json({
        message: 'Success',
        code: 200,
        point: examResult['point'],
        data: examResult['data']
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

function getRandomQuestion(numberOfQuestion) {
    let allQuestions = []
    const getAllQuestions = async (collection) => {
        allQuestions = await collection.find({}).toArray()
    }

    let shuffledQuestion = []

    run(getAllQuestions).then(_r => {
        shuffledQuestion = shuffleArray(allQuestions)
    })

    return shuffledQuestion.slice(0, numberOfQuestion)
}

function getQuestionById(id) {
    return readDatabase().filter(question => question.id === Number(id))[0]
}

function updateQuestion(req) {
    const questionId = Number(req.params.id)
    let updateQuestion = JSON.parse(req.body.data)
    updateQuestion.id = questionId
    let oldQuestion = readDatabase().filter(q => q.id === questionId)[0]
    updateQuestion.wrongCount = oldQuestion.wrongCount
    let updateData = readDatabase().filter(q => q.id !== questionId)
    updateData.push(updateQuestion)
    writeDatabase(updateData)
}

function updateWrongCount(questionId) {
    let data = readDatabase()
    let tempData = []
    for (let i = 0; i < data.length; i++) {
        if (data[i].id === questionId) {
            data[i].wrongCount = data[i].wrongCount + 1
        }
        tempData.push(data[i])
    }
    writeDatabase(tempData)
}

function deleteQuestion(questionId) {
    let data = readDatabase().sort((a, b) => a.id - b.id)
    let tempData = []
    let flag = false
    for (let i = 0; i < data.length; i++) {
        if (data[i].id === questionId) {
            flag = true
            continue
        }
        if (flag === true) {
            data[i].id = data[i].id - 1
        }
        tempData.push(data[i])
    }
    writeDatabase(tempData)
}

function readDatabase() {
    const data = fs.readFileSync('database.json', 'utf-8')
    return JSON.parse(data)
}

function writeDatabase(data) {
    fs.writeFileSync('database.json', JSON.stringify(data, null, 2), 'utf-8')
}

function getExamResult(answerData) {
    const maxPoint = 10
    let totalQuestion = 0
    let totalTrue = 0
    let responseData = []
    for (const key in answerData) {
        if (answerData.hasOwnProperty(key)) {
            totalQuestion++
            const checkResult = readDatabase().filter(q => q.id === Number(key)).map(q => {
                const a = q.trueAnswer === answerData[key]
                if (a) {
                    totalTrue++
                } else {
                    updateWrongCount(q.id)
                }
                return {
                    id: q.id,
                    check: a,
                    choose: answerData[key],
                    correctAnswer: q.trueAnswer,
                    correctContent: q.answer.filter(a => a.id === q.trueAnswer)[0].content
                }
            })[0]
            responseData.push(checkResult)
        }
    }
    const lastPoint = (totalTrue / totalQuestion * maxPoint).toFixed(2)
    return {
        point: lastPoint,
        data: responseData
    }
}
