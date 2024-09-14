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
        let questionBox = $(`<div id="block_question_${this.id}" style="background-color:#FFF8C9;" class="box app-shadow-border"><div class="subtitle section app-question-content">${this.questionContent}</div></div>`)

        for (const a of this.answer) {
            questionBox.append(`
                <div id="answer_field_q${this.id}_${a.id}" class="field">
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

    $('#submit_exam').click(async function () {
        $('#confirm_modal').addClass('is-active')
    })

    $('#confirm_submit_exam').on('click', async function () {

        $.post('api/submit-exam', mapUserAnswer, function(response) {
            $('#result_point').text(response['point'])
            $('#result_modal').addClass('is-active')
            $('#confirm_result_exam').click(function () {
                $('#result_modal').removeClass('is-active')
                for (let i = 0; i < response.data.length; ++i) {
                    const r = response.data[i];
                    const check = r['check']
                    const qId = r.id
                    const choose = r['choose']
                    const correct = r['correctAnswer']
                    const blockId = `block_question_${qId}`
                    const chooseId = `answer_field_q${qId}_${choose}`
                    const correctId = `answer_field_q${qId}_${correct}`
                    if (!check) {
                        $('#' + blockId).css('background-color', '#FFC5C5')
                    } else {
                        $('#' + blockId).css('background-color', '#C7DCA7')
                    }

                    $('#' + chooseId).css({
                        'padding-left' : '1rem',
                        'border' : '4px solid #D24545',
                        'border-radius' : '15px',
                        'margin-left' : '2rem !important'
                    })

                    $('#' + correctId).css({
                        'padding-left' : '1rem',
                        'border' : '4px solid #365E32',
                        'border-radius' : '15px',
                        'margin-left' : '2rem !important'
                    })
                }
            })
        })
        $('#confirm_modal').removeClass('is-active')
    })

    $('#cancel_submit_exam').on('click', async function () {
        $('#confirm_modal').removeClass('is-active')
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