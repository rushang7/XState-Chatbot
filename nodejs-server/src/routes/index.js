const express = require('express'),
    router = express.Router(),
    config = require('../envVariables'),
    chatService = require('../service/ChatService');

router.post(config.endPoint, (req, res) => { 
    chatService.dispatch(req, res); 
});

router.post('/message', (req, res) => chatService.receiveMessage(req, res));

router.get('/health', (req, res) => res.sendStatus(200));

module.exports = router;
