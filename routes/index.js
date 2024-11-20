const express = require('express')
const router = express.Router()

const pool = require('../db')

router.get('/', function (req, res) {
    res.render('index.njk', { title: 'Welcome' })
})

router.get('/highscore', async function (req, res) {
    try {
        const [scores] = await pool.promise().query(
            `SELECT * FROM score AS scores`
        );
        console.log(scores)
        return res.render('highscore.njk', {
            title: 'highscore',
            scores: scores
        })
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
    // res.render('index.njk', { title: 'Highscore' })
})

module.exports = router