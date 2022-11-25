const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  farmSize: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  irrigationType: {
    type: String,
    required:false
  }
});

const cropApiSchema = new mongoose.Schema({
  entries: [{
      API: {
          type: String
      },
      Description: {
          type: String
      },
      Link: {
          type: String
      },
      Category: {
          type: String
      }

  }]
});


const Connection = mongoose.model('cropApi', cropApiSchema);

const User = mongoose.model('User', UserSchema);

module.exports = {User,Connection};

