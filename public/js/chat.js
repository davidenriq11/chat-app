const socket = io()

// Elements
const $messageForm = document.querySelector('.form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#location')
const $messages = document.querySelector('#messages')

// Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('welcome', (message) => {
    console.log(message)

    // const chat = document.querySelector('#chat')
    // chat.insertAdjacentHTML('beforeend', `<li>${message}</li>`);
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render($locationTemplate, {
        username: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format('HH:MM:SS a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:MM:SS a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})


$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = $messageFormInput.value

    if (message.length > 0) {
        socket.emit('message', message, (error) => {
            $messageFormButton.removeAttribute('disabled')
            if (error) {
                return console.log(error)
            }

            console.log('The message was delivered')
        })
    }
    $messageFormButton.removeAttribute('disabled')

    $messageFormInput.value = ''
    $messageFormInput.focus()
})

$locationButton.addEventListener('click', (event) => {
    $locationButton.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            lng: position.coords.longitude,
            lat: position.coords.latitude,
        }
        socket.emit('sendLocation', location, (aknowlegdement) => {
            $locationButton.removeAttribute('disabled')

            console.log(aknowlegdement)
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData', ({ room, users }) => {
    console.log(room)
    console.log(users)
    const html = Mustache.render($sidebarTemplate, { room, users })
    document.querySelector('#sidebar').innerHTML = html
})
