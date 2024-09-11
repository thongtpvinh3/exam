let mapUserAnswer = {}
let listQuestion = []

class Question {
    constructor(question) {
        this.questionContent = question.question
        this.answer = question.answer
        this.trueAnswer = question.trueAnswer
        this.id = question.id
    }

    getQuestionBlockContent() {
        let questionBox = $(`<div style="background-color:#7ba7b9;" class="box app-shadow-border"><div class="subtitle section app-question-content">${this.questionContent}</div></div>`)

        for (const a of this.answer) {
            questionBox.append(`
                <div class="field">
                    <label class="radio">
                        <input type="radio" name="q_${this.id}" value="${a.id}">
                        <span class="ml-3">${a.content}</span>
                    </label>
                </div>
            `)
        }
        return questionBox
    }

    addBlockQuestion() {
        let mainQuestionDom = $('#questions_content')
        mainQuestionDom.append(this.getQuestionBlockContent())
    }
}

$(document).ready(function () {

    $modal.addClass('is-active')

    $('#start_exam').click(async function () {
        mapUserAnswer = {}

        listQuestion = await getRandomQuestion()
        addQuestionToContent(listQuestion)

        startTimer()
        $('#submit_exam').show()
        $(window).on('scroll resize', checkVisibility)
        checkVisibility()
    })
})

function addQuestionToContent(randomQuestion) {
    for (const q of randomQuestion) {
        const question = new Question(q)
        question.addBlockQuestion()
        mapUserAnswer[q.id] = ''
        $(`input[name="q_${q.id}"]`).change(function () {
            mapUserAnswer[q.id] = $(this).val()
        })
    }
}

async function getRandomQuestion() {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            $.ajax({
                type: "GET",
                dataType: 'json',
                url: '/api/questions/random'
            }).then((result) => {
                if (result['code'] === 200) {
                    listQuestion = result.data
                }
            })
            if (listQuestion.length > 0) {
                clearInterval(interval)
                resolve(listQuestion)
            } else {
                console.log('Waiting to get question from server...')
            }
        }, 100)
    })
}