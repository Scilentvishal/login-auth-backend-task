const User = require("../models/User");
const bcrypt = require("bcryptjs");
const router = require("express").Router();

router.post("/register", async (req, res) => {
    
  try {
    const salt = await bcrypt.getSalt(10)
    const { name, email,password, hobbies, gender, mobile, profileImage } = req.body;
const hashedPassword = await bcrypt.hash(password, salt)

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create a new user instance
    const user = new User({
      name,
      email,
      password: hashedPassword,
      hobbies,
      gender,
      mobile,
      profileImage,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
