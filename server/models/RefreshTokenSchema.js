const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const refreshTokenSchema = new Schema(
    {
      token: {
        type: String,
        required: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      expireTime: {
        type: Number
      }
    },
    { timestamps: true }
  );
  
  const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
  
  module.exports = RefreshToken;