const generateMessage = (username, messageText) => {
    return {
        username,
        text: messageText,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, url) => {
    return {
        url,
        username,
        createdAt: new Date().getTime()
    }
}

module.exports = { generateMessage, generateLocationMessage }
