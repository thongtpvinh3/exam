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
    updateQuestion(req)
    res.json({
        message: 'Success',
        code: 200
    })
})

app.post('/api/question-form/delete/:id', (req, res) => {
    deleteQuestion(Number(req.params.id))
    res.json({
        message: 'Success',
        code: 200
    })
})

app.post('/api/submit-exam', (req, res) => {

    res.json({
        message: 'Success',
        code: 200,
        point : 10,
        data : {}
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
    let lastQuestionId = database.length
    newQuestion.id = lastQuestionId + 1
    newQuestion.wrongCount = 0
    database.push(newQuestion)
    writeDatabase(database)
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

function weightedRandomSelection(questions, count) {
    // Tính tổng trọng số
    const totalWeight = questions.reduce((sum, question) => sum + question.wrongCount, 0);

    // Hàm lấy ngẫu nhiên một câu hỏi dựa trên trọng số
    function selectRandomQuestion() {
        let random = Math.random() * totalWeight;
        for (let i = 0; i < questions.length; i++) {
            random -= questions[i].wrongCount;
            if (random <= 0) {
                return questions[i];
            }
        }
    }

    const selectedQuestions = [];
    while (selectedQuestions.length < count) {
        const question = selectRandomQuestion();

        // Đảm bảo không chọn trùng câu hỏi
        if (!selectedQuestions.includes(question)) {
            selectedQuestions.push(question);
        }
    }

    return selectedQuestions;
}
