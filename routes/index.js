const express = require('express')
const router = express.Router()

router.get('/', function (req, res) {
    res.render('index.njk', { title: 'Welcome' })
})

router.get('/highscore', function (req, res) {
    res.render('index.njk', { title: 'Highscore' })
})

module.exports = router