const mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
  username: {
    type: String
  }, 
})

const User = mongoose.model("User", userSchema)

let exerciseSchema = new mongoose.Schema({
  user_id: {
    type: 'ObjectId',
    ref: 'User'
  },
  description: String,
  duration: String,
  date: Date
})

const Exercise = mongoose.model("Exercise", exerciseSchema)

module.exports = {
  User, Exercise
}