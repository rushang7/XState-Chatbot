const express = require('express'),
    router = express.Router(),
    config = require('../env-variables'),
    sessionManager = require('./session-manager');

router.post('/response', async (req, res) =>  {
    try {
        let systemResponse = req.body;
        sessionManager.fromSystem(systemResponse);
    } catch(e) {
        console.log(e);
    }
    res.end();
});

module.exports.router = router;
