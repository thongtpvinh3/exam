const express = require('express')
const path = require('path')
const shuffleArray = require('./common2')
const fs = require('fs')
const bodyParser = require('body-parser')
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001

app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname)))
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

app.get('/api/random-question', (req, res) => {
    res.json({
        message: 'Success',
        code: 200,
        data: getRandomQuestion(),
    })
})

app.get('/api/questions/random', (req, res) => {
    res.json({
        message: 'Success',
        code: 200,
        data: getRandomQuestion(),
    })
})

app.get('/api/questions', async (req, res) => {
    await sleep(Math.floor(Math.random() * (2000 - 500 + 1)) + 500)

    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    const allQuestions = readDatabase().sort((a, b) => b.id - a.id).map(q => {
        return {id: q.id, content: q.question}
    })
    res.json({
        message: 'Success',
        code: 200,
        totalRecords: allQuestions.length,
        data: allQuestions
    })
})

app.get('/api/questions/:id', (req, res) => {
    const question = getQuestionById(req.params.id)
    res.json({
        message: 'Success',
        code: 200,
        data: question,
    })
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/exam', (req, res) => {
    res.sendFile(path.join(__dirname, 'exam.html'))
})

app.get('/question-form', (req, res) => {
    res.sendFile(path.join(__dirname, 'question-form.html'))
})

app.post('/api/question-form', (req, res) => {
    const newQuestion = JSON.parse(req.body.data)
    addNewQuestion(newQuestion)
    res.json({
        message: 'Success',
        code: 200,
        data: readDatabase()
    })
})

app.post('/api/question-form/:id', (req, res) => {
    const questionId = Number(req.params.id)
    let updateQuestion = JSON.parse(req.body.data)
    updateQuestion.id = questionId
    let updateData = readDatabase().filter(q => q.id !== questionId)
    updateData.push(updateQuestion)
    writeDatabase(updateData)
    res.json({
        message: 'Success',
        code: 200
    })
})

app.post('/api/question-form/delete/:id', (req, res) => {
    const questionId = Number(req.params.id)
    let updateData = readDatabase().filter(q => q.id !== questionId)
    writeDatabase(updateData)
    res.json({
        message: 'Success',
        code: 200
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

function getRandomQuestion() {
    const shuffledQuestion = shuffleArray(readDatabase())
    return shuffledQuestion.slice(0, 3)
}

function  getQuestionById(id) {
        return readDatabase().filter(question => question.id === Number(id))[0]
}

function addNewQuestion(newQuestion) {
    const database = readDatabase()
    let lastQuestionId = database[database.length - 1].id
    newQuestion.id = lastQuestionId + 1
    newQuestion.wrongCount = 0
    database.push(newQuestion)
    writeDatabase(database)
}

function readDatabase() {
    const data = fs.readFileSync('database.json', 'utf-8')
    return JSON.parse(data)
}

function writeDatabase(data) {
    fs.writeFileSync('database.json', JSON.stringify(data, null, 2), 'utf-8')
}
