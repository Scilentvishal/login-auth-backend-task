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

    // res.cookie("jwt", token, {
    //   httpOnly: true,
    //   maxAge: 2 * 24 * 60 * 60 * 1000, // 1 week
    //   sameSite: "none",
    //   secure: true,
    // });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.post("/user", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "JWT token not provided" });
    }

    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid JWT token format" });
    }

    const tokenValue = tokenParts[1];
    const claims = jwt.verify(tokenValue, "mysecretKey");

    console.log(`token : ${token}`);
    console.log(claims);
    if (!claims) {
      return res.status(401).json({ message: "Invalid JWT token" });
    }

    const user = await User.findOne({ _id: claims._id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...data } = await user.toJSON();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.post("/logout", (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });

    res.send({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
