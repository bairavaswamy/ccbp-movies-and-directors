const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')
const app = express()

app.use(express.json())

const dbpath = path.join(__dirname, 'moviesData.db')
let db = null
const functionDbIniting = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running')
    })
  } catch (error) {
    console.log(`Database Error ${error.message}`)
    process.exit(1)
  }
}

functionDbIniting()

app.get('/movies/', async (request, respond) => {
  try {
    const querry = `SELECT movie_name FROM movie;`
    const result = await db.all(querry)

    const movieNameChange = data => {
      return {
        movieName: data.movie_name,
      }
    }
    respond.send(result.map(each => movieNameChange(each)))
    await db.close()
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.error(`Query Error: ${error.message}`)
  }
})

app.post('/movies/', async (request, respond) => {
  try {
    const {directorId, movieName, leadActor} = request.body
    const querry = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(?,?,?)
    ;`
    const result = await db.run(querry, [directorId, movieName, leadActor])
    respond.send('Movie Successfully Added')
    await db.close()
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.error(`Query Error: ${error.message}`)
  }
})

app.get('/movies/:movieId/', async (request, response) => {
  try {
    const {movieId} = request.params
    const movieQuerry = `SELECT * FROM movie WHERE movie_id = ?;`
    const result = await db.get(movieQuerry, [movieId])
    const movieNameChange = data => {
      return {
        movieId: data.movie_id,
        directorId: data.director_id,
        movieName: data.movie_name,
        leadActor: data.lead_actor,
      }
    }
    response.send(movieNameChange(result))
    await db.close()
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.log(`Query Error ${error.message}`)
  }
})

app.put('/movies/:movieId/', async (request, response) => {
  try {
    const {movieId} = request.params
    const {directorId, movieName, leadActor} = request.body
    const movieQuerry = `UPDATE movie 
    SET director_id =?,movie_name =?,lead_actor =? WHERE movie_id =?;`
    const result = await db.run(movieQuerry, [
      directorId,
      movieName,
      leadActor,
      movieId,
    ])
    response.send('Movie Details Updated')
    await db.close()
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.log(`Query Error ${error.message}`)
  }
})
app.delete('/movies/:movieId/', async (request, response) => {
  try {
    const {movieId} = request.params
    const movieQuerry = `DELETE FROM movie WHERE movie_id = ?;`
    await db.run(movieQuerry, [movieId])
    response.send('Movie Removed')
    await db.close()
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.log(`Query Error ${error.message}`)
  }
})

app.get('/directors/', async (request, respond) => {
  try {
    const querry = `SELECT * FROM director;`
    const result = await db.all(querry)

    const movieNameChange = data => {
      return {
        directorId: data.director_id,
        directorName: data.director_name,
      }
    }
    respond.send(result.map(each => movieNameChange(each)))
    await db.close()
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.error(`Query Error: ${error.message}`)
  }
})

app.get('/directors/:directorId/movies', async (request, respond) => {
  try {
    const {directorId} = request.params
    const querry = `SELECT movie_name FROM movie
    WHERE director_id = ?;`
    const result = await db.all(querry, [directorId])
    respond.send(result.map(each => ({movieName: each.movie_name})))
    await db.close()
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.error(`Query Error: ${error.message}`)
  }
})

module.exports = app
