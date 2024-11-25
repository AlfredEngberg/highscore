const express = require('express')
const router = express.Router()

const pool = require('../db')

// uuid saker
const { v4: uuidv4 } = require('uuid');
const key = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
console.log(key)

router.get('/', function (req, res) {
    res.render('index.njk', { title: 'Welcome' })
})

router.get('/highscore', async function (req, res) {
    try {
        const [scores] = await pool.promise().query(
            `SELECT * FROM score AS scores ORDER BY score DESC LIMIT 10;`
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

// Get new highscorwe page
router.get('/newHighscore', async function (req, res) {
    res.render('newHighscore.njk')
})

// post high score route
router.post('/newHighscore', async function (req, res) {
    const username = req.body.username
    const score = req.body.score
    const game = req.body.game

    try {
        const [result] = await pool.promise().query('INSERT INTO score (username, score, game) VALUES (?, ?, ?);', [username, score, game])
        console.log(result)
        return res.redirect('/')
    } catch (error) {
        console.log('DET BLEV FEL')
        console.log(error)
        return res.json(error)
    }

})

module.exports = router