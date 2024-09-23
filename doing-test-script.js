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

    $('#btn_cd1').click(function () {
        changeThemeWhileClickSubject('1')
    })
    $('#btn_cd2').click(function () {
        changeThemeWhileClickSubject('2')
    })
    $('#btn_cd3').click(function () {
        changeThemeWhileClickSubject('3')
    })
    $('#btn_merge').click(function () {
        changeThemeWhileClickSubject('4')
    })

    $('#start_exam').click(async function () {
        mapUserAnswer = {}

        getRandomQuestion().then((result) => {
            if (result['code'] === 200) {
                listQuestion = result.data
            }
        })
        const interval = setInterval(() => {
            if (listQuestion.length > 0) {
                $('#div_timer').show()
                addQuestionToContent(listQuestion)
                startTimer()
                $('#submit_exam').show()
                $(window).on('scroll resize', checkVisibility)
                checkVisibility()
                clearInterval(interval)
            } else {
                console.log('Waiting to get question from server...')
            }
        }, 100)
    })

    $('#submit_exam').click(async function () {
        $('#confirm_modal').addClass('is-active')
    })

    $('#confirm_submit_exam').on('click', async function () {
        pauseTimer()
        submit()
        $('#confirm_modal').removeClass('is-active')
        $('#submit_exam').text('Làm lại bài kiểm tra').off('click').click(function () {
            window.location.href = '/exam'
        })
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

function getRandomQuestion() {
    return $.ajax({
        type: "GET",
        dataType: 'json',
        url: '/api/questions/random/' + subject
    })
}

function submit() {
    $.post('api/submit-exam', mapUserAnswer, function(response) {
        $('#result_point').text(`${response['trueCount']}/${response['totalQuestion']}`)
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
}

let subject = 1

function changeThemeWhileClickSubject(subjectId) {
    let btnCd1Dom = $('#btn_cd1')
    let btnCd2Dom = $('#btn_cd2')
    let btnCd3Dom = $('#btn_cd3')
    let btnMergeDom = $('#btn_merge')
    let descSubDom = $('#div_description_subject')
    let descSubPDom = $('#div_description_subject p')
    descSubDom.hide()
    switch (subjectId) {
        case '1':
            btnCd2Dom.css('background-color', '#FAF3F0').css('box-shadow', 'none')
            btnCd3Dom.css('background-color', '#B5C0D0').css('box-shadow', 'none')
            btnMergeDom.css('background-color', '#FFD59E').css('box-shadow', 'none')
            btnCd1Dom.css({
                'background-color': '#a670fc',
                'box-shadow': '5px 5px rgba(166, 112, 252, 0.3)'
            })
            descSubDom.show()
            descSubPDom.text('Hệ thống chính trị, tổ chức bộ máy của Đảng, Nhà nước, các tổ chức chính trị-xã hội')
            subject = 1
            break;
        case '2':
            btnCd1Dom.css('background-color', '#DFCCFB').css('box-shadow', 'none')
            btnCd3Dom.css('background-color', '#B5C0D0').css('box-shadow', 'none')
            btnMergeDom.css('background-color', '#FFD59E').css('box-shadow', 'none')
            btnCd2Dom.css({
                'background-color': '#f5a685',
                'box-shadow': '5px 5px rgba(245, 166, 133, 0.3)'
            })
            descSubDom.show()
            descSubPDom.text('Quản lý hành chính nhà nước')
            subject = 2
            break;
        case '3':
            btnCd2Dom.css('background-color', '#FAF3F0').css('box-shadow', 'none')
            btnCd1Dom.css('background-color', '#DFCCFB').css('box-shadow', 'none')
            btnMergeDom.css('background-color', '#FFD59E').css('box-shadow', 'none')
            btnCd3Dom.css({
                'background-color': '#829fcb',
                'box-shadow': '5px 5px rgba(130, 159, 203, 0.3)'
            })
            descSubDom.show()
            descSubPDom.text('Công chức, công vụ')
            subject = 3
            break;
        case '4':
            btnCd2Dom.css('background-color', '#FAF3F0').css('box-shadow', 'none')
            btnCd3Dom.css('background-color', '#B5C0D0').css('box-shadow', 'none')
            btnCd1Dom.css('background-color', '#DFCCFB').css('box-shadow', 'none')
            btnMergeDom.css({
                'background-color': '#ec9a32',
                'box-shadow': '5px 5px rgba(241, 180, 101, 0.3)'
            })
            descSubDom.show()
            descSubPDom.text('Tổng hợp tất cả các chuyên đề')
            subject = 4
            break;
        default:
            break;
    }
    $('#start_exam').show()
}