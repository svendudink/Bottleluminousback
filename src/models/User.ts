import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  emailAdress: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  aboutCompany: {
    type: String,
    required: false,
  },
  companyName: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  yourName: {
    type: String,
    required: false,
  },

  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

const User = mongoose.model("User", userSchema);

export default User;
