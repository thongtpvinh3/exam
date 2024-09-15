let allQuestions = []

$(document).ready(async function () {
    await loadAllQuestions()

    $('#questionForm').on('submit', function (event) {
        event.preventDefault()

        const formData = new FormData(this)
        const data = {
            question: formData.get('question'),
            trueAnswer: formData.get('trueAnswer'),
            answer: [
                {id: 'A', content: formData.get('answerA')},
                {id: 'B', content: formData.get('answerB')},
                {id: 'C', content: formData.get('answerC')},
                {id: 'D', content: formData.get('answerD')}
            ]
        }

        $.post("/api/question-form", {data: JSON.stringify(data)}, function (response) {
            console.log(response.code)
            if (response.code === 200) {
                showNotificationSuccess('Thêm câu hỏi thành công')
                clearContentFormQuestion()
                loadAllQuestions()
            } else {
                showNotificationFailed('Thêm câu hỏi thất bại')
            }
        })
    })

    $('#modal_close').click(function () {
        closeNotification()
    })

    $('#info_question_modal_close').click(function () {
        $('#question_info_form').prop('question_id', '')
        $('#question_info_modal').css('visibility', 'hidden').css('opacity', '0')
    })

    $('#btn_update_question').click(function () {
        const idQuestion = $('#question_info_form').prop('question_id')
        const updateData = {
            question: $('#iq_question').val(),
            trueAnswer: $('#iq_ans').val(),
            answer: [
                {id: 'A', content: $('#iq_ansA').val()},
                {id: 'B', content: $('#iq_ansB').val()},
                {id: 'C', content: $('#iq_ansC').val()},
                {id: 'D', content: $('#iq_ansD').val()}
            ]
        }

        $.post("/api/question-form/" + idQuestion, {data: JSON.stringify(updateData)}, async function (response) {
            if (response.code === 200) {
                showNotificationSuccess('Cập nhật câu hỏi thành công')
                $('#question_info_modal').css('visibility', 'hidden').css('opacity', '0')
                await loadAllQuestions()
            } else {
                showNotificationFailed('Cập nhật câu hỏi thất bại')
            }
        })
    })

    $('#btn_delete_question').click(function () {
        const idQuestion = $('#question_info_form').prop('question_id')
        $.post("/api/question-form/delete/" + idQuestion, async function (response) {
            if (response.code === 200) {
                showNotificationSuccess('Xóa câu hỏi thành công')
                $('#question_info_modal').css('visibility', 'hidden').css('opacity', '0')
                await loadAllQuestions()
            } else {
                showNotificationFailed('Xóa câu hỏi thất bại')
            }
        })
    })
})

function clearContentFormQuestion() {
    let questionFormDom = $('#questionForm')
    questionFormDom.find('input, textarea, select').val('');
    questionFormDom.find('select').prop('selectedIndex', 0);
}

function getQuestionUi(question) {
    return `
        <div id="${question['id']}" class="question-content" onclick="getQuestionInfo(${question['id']})" title="Câu ${question['id']}: ${question['content']}">
            <p><strong>Câu ${question['id']}: </strong>${question['content']}</p>
        </div>
    `
}

function getQuestionInfo(id) {
    $.ajax({
        type: "GET",
        dataType: 'json',
        url: '/api/questions/' + id
    }).then((result) => {
        if (result['code'] !== 200) {
            showNotificationFailed(result['message'])
        } else {
            const resData = result['data']
            $('#question_info_form').prop('question_id', id)

            $('#iq_question').val(resData['question'])
            $('#iq_ansA').val(resData['answer'][0]['content'])
            $('#iq_ansB').val(resData['answer'][1]['content'])
            $('#iq_ansC').val(resData['answer'][2]['content'])
            $('#iq_ansD').val(resData['answer'][3]['content'])
            $('#iq_ans').val(resData['trueAnswer'])

            $('#question_info_modal').show().css('visibility', 'visible').css('opacity', '1')
        }
    })
}

async function loadAllQuestions() {
    allQuestions = await getAllQuestions()
    if (allQuestions !== 'null') {
        let mainQuestionDom = $('#all_question_content')
        mainQuestionDom.empty()
        for (let question of allQuestions) {
            let questionDom = getQuestionUi(question)
            mainQuestionDom.append(questionDom)
        }
    }
}

async function getAllQuestions() {
    return new Promise(resolve => {
        $.ajax({
            type: "GET",
            dataType: 'json',
            url: '/api/questions'
        }).then((result) => {
            if (result['code'] !== 200) {
                showNotificationFailed(result['message'])
                resolve('null')
            } else {
                $('.app-loader-wrapper').hide()
                resolve(result.data)
            }
        })
    })
}

function backToHome() {
    window.location.href = '/'
}
