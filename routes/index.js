const express = require('express')
const { query, matchedData, validationResult, body, params } = require('express-validator')
const app = express()
const router = express.Router()
// const session = require('express-session')

const pool = require('../db')

// uuid saker
const { v4: uuidv4 } = require('uuid');
const e = require('express')

router.get('/', function (req, res) {
    res.render('index.njk', { title: 'Welcome' })
})

// Get highscore page route
router.get('/highscore', async function (req, res) {
    try {
        const [games] = await pool.promise().query('SELECT * FROM game AS game');
        return res.render('highscore.njk', {
            title: 'highscore',
            games: games
        })
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})
router.get('/highscore/:key', async function (req, res) {
    let scores = []
    try {
        [scores] = await pool.promise().query(
            `SELECT
  score.score AS score,
  game.name AS game,
  user.name AS username
FROM
  score
  JOIN game ON score.game_id = game.id
  JOIN user ON score.user_id = user.id
WHERE
  game.key = ?
ORDER BY
  score DESC
LIMIT
  10;`, [req.params.key]);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
    console.log(scores)
    res.render('gameHighscores.njk', { scores })
})

// Get new highscorwe page
router.get('/newHighscore', async function (req, res) {
    const [games] = await pool.promise().query('SELECT * FROM game AS game');
    /*   console.log(games) */
    res.render('newHighscore.njk', { games })
})

// post high score route
router.post('/newHighscore',
    body('username').notEmpty().isString().trim().escape(),
    async function (req, res) {
        const result = validationResult(req)
        /* const username = req.body.username */
        const score = req.body.score
        const game = req.body.game

        if (result.isEmpty()) {
            const data = matchedData(req)
            try {
                const [dbResult] = await pool.promise().query('INSERT INTO score (score, score.user_id, score.game_id) VALUES (?, ?, ?);', [score, data.username, game])
                console.log(dbResult)
                return res.redirect('/')
            } catch (error) {
                console.log('DET BLEV FEL I POST HIGHSCORE')
                console.log(error)
                return res.json(error)
            }
        } else {
            console.log(result)
            return res.json(result)
        }
    })

// Get new game page
router.get('/newGame', async function (req, res) {
    res.render('newGame.njk')
})

// post new game
router.post('/newGame',
    body('gameName').notEmpty().isString().trim().escape(),
    async function (req, res) {
        const result = validationResult(req)
        const key = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
        // const gameName = req.body.gameName
        if (result.isEmpty()) {
            const data = matchedData(req)
            try {
                const [dbResult] = await pool.promise().query(`INSERT INTO
  game (name, \`key\`, created_at, updated_at)
VALUES
  (?, ?, now(), now());`, [data.gameName, key])
                console.log(dbResult)
                return res.redirect('/')
            } catch (error) {
                console.log('DET BLEV FEL I POST GAME')
                console.log(error)
                return res.json(error)
            }
        } else {
            console.log(result)
            return res.json(result)
        }
    })


// Admin page
router.get('/adminPage', async function (req, res) {
    const [scores] = await pool.promise().query(
        `            SELECT
                        score.score AS score,
                        game.name AS game,
                        user.name AS username
                    FROM
                        score
                    JOIN game ON score.game_id = game.id
                    JOIN user ON score.user_id = user.id
                    ORDER BY score DESC`
    );

    const [games] = await pool.promise().query('SELECT * FROM game AS game');
    const [users] = await pool.promise().query('SELECT * FROM user AS user');

    console.log(scores)
    return res.render('adminPage.njk', {
        title: 'Admin Page',
        scores: scores,
        games: games,
        users: users
    })
})

// Get edit game page
router.get('/game/:id/edit', async function (req, res) {
    res.render('editGame.njk', { id: req.params.id })
})

// Post edit game
router.post('/game/edit',
    body('id').isInt({ min: 0 }).withMessage('Game is required').toInt().notEmpty().escape(),
    body('gameName').notEmpty().isString().trim().escape(),
    async function (req, res) {
        const result = validationResult(req)

        if (result.isEmpty()) {
            const data = matchedData(req)
            try {
                const [dbResult] = await pool.promise().query(`UPDATE game SET name = ?, updated_at = now() WHERE id = ?;`, [data.gameName, data.id])
                console.log(dbResult)
                return res.redirect('/adminPage')
            } catch (error) {
                console.log('DET BLEV FEL I UPDATE GAME')
                console.log(error)
                return res.json(error)
            }
        } else {
            console.log(result)
            return res.json(result)
        }
    })

// Get delete game page
router.get('/game/:id/delete', async function (req, res) {
    res.render('deleteGame.njk', { id: req.params.id })
})

// Post delete game
router.post('/game/delete',
    body('id').isInt({ min: 0 }).withMessage('Game is required').toInt().notEmpty().escape(),
    async function (req, res) {
        const game_id = req.body.id
        console.log(req.body.id)
        try {
            const [result] = await pool.promise()
                .query(`DELETE FROM game WHERE id = ?;`, [game_id])
            console.log(result)
            return res.redirect('/adminPage')
        } catch (error) {
            console.log('DET BLEV FEL I DELETE GAME')
            console.log(error)
            return res.json(error)
        }
    })
module.exports = router