const express = require('express'),
    router = express.Router(),
    config = require('../env-variables'),
    chatSessionManager = require('../chat-session-manager/chat-session-manager'),
    channelProvider = require('../channel-provider');

router.post(config.endPoint, (req, res) => { 
    chatService.dispatch(req, res); 
});

router.post('/message', (req, res) =>  {
    try {
        let reformattedMessage = channelProvider.reformatIncomingMessage(req);
        chatSessionManager.fromUser(reformattedMessage);
    } catch(e) {
        console.log(e);
    }
    res.end();
});

router.get('/health', (req, res) => res.sendStatus(200));

module.exports = router;
