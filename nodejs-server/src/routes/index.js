const express = require('express'),
    router = express.Router(),
    config = require('../envVariables'),
    chatSessionManager = require('../chat_session_manager/ChatSessionManager');

router.post(config.endPoint, (req, res) => { 
    chatService.dispatch(req, res); 
});

router.post('/message', (req, res) =>  {
    chatSessionManager.receiveMessage(req);
    res.sendStatus(200);
});

router.get('/health', (req, res) => res.sendStatus(200));

module.exports = router;
