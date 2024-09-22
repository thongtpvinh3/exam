function showNotificationSuccess(text) {
    $('#modal_header').text('Thành công').css('color', 'green');
    $('#modal_desc_text').text(text)
    $('#notification_modal').show().css('visibility', 'visible').css('opacity', '1')
}

function showNotificationFailed(text) {
    $('#modal_header').text('Thất bại').css('color', 'red')
    $('#modal_desc_text').text(text)
    $('#notification_modal').show().css('visibility', 'visible').css('opacity', '1')
}

function closeNotification() {
    $('#notification_modal').css('visibility', 'hidden').css('opacity', '0')
    $('#modal_header').text('')
    $('#modal_desc_text').text('')
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function doSleep(milliseconds) {
    await sleep(milliseconds)
}

function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}