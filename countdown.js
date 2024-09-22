let timer
let totalSeconds = 30 * 60
let running = false

const $timerDisplay = $('#timer')
const $fixedTimerDisplay = $('#fixedTimer')
const $modal = $('#startModal')

function updateTimer() {
    const minute = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    const formattedTime = String(minute).padStart(2, '0') + ':' + String(secs).padStart(2, '0')

    $timerDisplay.text(formattedTime)
    $fixedTimerDisplay.text(formattedTime)

    if (totalSeconds <= 3 * 60) {
        $fixedTimerDisplay.removeClass('blinking')
        $fixedTimerDisplay.show().addClass('critical')
            .css('display', 'flex')
            .css('align-items', 'center')
            .css('justify-content', 'center')
    } else {
        $fixedTimerDisplay.removeClass('critical')
    }
}

function startTimer() {
    if (!running) {
        timer = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds--
                updateTimer()
            } else {
                clearInterval(timer)
                running = false
                submit()
            }
        }, 1000)
        running = true
        $modal.removeClass('is-active')
    }
}

function pauseTimer() {
    if (running) {
        clearInterval(timer)
        running = false
    }
}

function resetTimer() {
    clearInterval(timer)
    totalSeconds = 30 * 60
    updateTimer()
    running = false
}

function checkVisibility() {
    const timerOffset = $timerDisplay.offset().top
    const scrollTop = $(window).scrollTop()
    const windowHeight = $(window).height()

    if (scrollTop + windowHeight < timerOffset || scrollTop > timerOffset + $timerDisplay.outerHeight()) {
        if (totalSeconds <= 3 * 60) {
            $fixedTimerDisplay.removeClass('blinking')
            $fixedTimerDisplay.show().addClass('critical')
                .css('display', 'flex')
                .css('align-items', 'center')
                .css('justify-content', 'center')
        } else {
            $fixedTimerDisplay.removeClass('critical')
            $fixedTimerDisplay.show().addClass('blinking')
                .css('display', 'flex')
                .css('align-items', 'center')
                .css('justify-content', 'center')
        }
    } else {
        $fixedTimerDisplay.hide().removeClass('blinking')
        $fixedTimerDisplay.removeClass('critical')
    }
}

updateTimer()