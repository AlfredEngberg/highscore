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

// Get highscore page route
router.get('/highscore', async function (req, res) {
    try {
        const [scores] = await pool.promise().query(
            `            SELECT
  score.score AS score,
  game.name AS game,
  user.name AS username
FROM
  score
  JOIN game ON score.game_id = game.id
  JOIN user ON score.user_id = user.id
ORDER BY score DESC
LIMIT 10`
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
    const [games] = await pool.promise().query('SELECT * FROM game AS game');
  /*   console.log(games) */
    res.render('newHighscore.njk', {games})
})

// post high score route
router.post('/newHighscore', async function (req, res) {
    const username = req.body.username
    const score = req.body.score
    const game = req.body.gameType

    try {
        const [result] = await pool.promise().query('INSERT INTO score (score, score.user_id, score.game_id) VALUES (?, ?, ?);', [score, username, game])
        console.log(result)
        return res.redirect('/')
    } catch (error) {
        console.log('DET BLEV FEL I POST HIGHSCORE')
        console.log(error)
        return res.json(error)
    }

})

module.exports = router