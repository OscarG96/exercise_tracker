const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.set('strictQuery', false);
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}
app.use(cors())
app.use(express.static('public'))

const { User, Exercise } = require('./mongoose/models')
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res, next) => {
  try {
    const { username } = req.body
    if (!username) {
      console.log("No user provided")
      throw new Error('Must provide username')
    }
    const user = new User({
      username
    })
    user.save((err, data) => {
      if (err) {
        throw err
      }
      res.send(data)
    })
  } catch (error) {
      next(error)
  }
})

app.post('/api/users/:_id/exercises', (req, res, next) => {
  
  try {
    const { description, duration, date } = req.body
    const user_id = req.params._id
    console.log('date', date)
    // let _date = new Date(date) ?? new Date()
    let _date;
    if (date) {
      _date = new Date(date)
    } else {
      _date = new Date()
    }
    console.log('_date', _date)
    const exercise = new Exercise({
      description, 
      duration, 
      date: _date,
      user_id
    })
    exercise.save( async (err, data) => {
      if (err) {
        throw err
      }
      const user = await User.findById(data.user_id).exec()
      console.log("user", user)
      const response = {
        username: user.username,
        description: data.description,
        duration: data.duration,
        date: data.date,
        _id: user._id
      }
      res.status(200).json(response)
    })
  } catch (error) {
    next(error)
  }

}) 

app.get('/api/users', (req, res, next) => {
  try {
    User.find({}, (err, users) => {
      if (err) {
        throw err
      }
      console.log('users', users)
      res.send(users)
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/users/:_id/logs', async (req, res, next) => {
  const { from, to, limit } = req.query
  try {
    let exercises
    const user = await User.findById(req.params._id).exec()
    const query_exercises = Exercise.find({
      user_id: req.params._id
    })
    if (limit) {
      query_exercises.limit(parseInt(limit))
    }
    if (from) {
      query_exercises.where('date').gt(from)
    }
    if(to) {
      query_exercises.where('date').lt(to)
    }
    const results = await query_exercises.exec()
    // query_exercises.exec(function (err, results) {
    //   if (err) throw err
    //   console.log('results', results)
    //   return res.send(results)
    //   exercises = results
    // })
    console.log('exercises', results)
    // const logs = exercises.map(exercise => ({
    //   description: exercise.description,
    //   duration: exercise.description,
    //   date: exercise.date
    // }))
    // const response = {
    //   username: user.username,
    //   count: exercises.length,
    //   logs
    // }
    res.send(results)
  } catch (error) {
    next(error)
  }
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
