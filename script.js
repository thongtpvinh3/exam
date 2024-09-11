$(document).ready(function () {
    setTimeout(() => {
        $('.app-loading').hide()
    }, Math.floor(Math.random() * (3000 - 500 + 1)) + 50)

    $('#do_exam').attr('href', '/exam')
    $('#manage_question').attr('href', '/question-form')
})
