const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();

router.post("/register", async (req, res) => {
  // console.log(`resss: ${req.body}`)
  try {
    const salt = await bcrypt.genSalt(10);
    const { name, email, password, hobbies, gender, mobile, profileImage } =
      req.body;
    const hashedPassword = await bcrypt.hash(password, salt);

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

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ _id: user._id }, "mysecretKey");
    // Return success response
    // res.send(token);

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    });

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/user", async (req, res) => {
  const cookie = req.cookies["jwt"];
  const claims = jwt.verify(cookie, "mysecretKey");

  if (!claims) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const user = await User.findOne({ _id: claims._id });
  res.send(user);
});

module.exports = router;
