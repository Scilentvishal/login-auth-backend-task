const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const Students = require("../models/Students");
const path = require("path");
const multer = require("multer");
const multerErrorHandler = require("../utils/multerErrorHandler");


router.use(multerErrorHandler);

const storage = multer.diskStorage({
  destination: "./upload/profile",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  // limits: { fileSize: 1000000 },
});

router.post("/imgUpload", upload.single("profile"), function (req, res) {
  // console.log(req.file)
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // if (req.file.size > 1000000) {
  //   return res.status(500).json({ message: "Please upload a file less than 1 MB" });
  // }

  console.log(req.file);
  res.json({
    success: 0,
    profile_url: `http://localhost:5000/profile/${req.file.filename}`
  })
});

router.post("/register", async (req, res) => {
  // console.log(`resss: ${req.body}`)
  try {
    const salt = await bcrypt.genSalt(10);
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create a new user instance
    const user = new User({
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/addstudents", async (req, res) => {
  try {
    const { name, email, hobbies, gender, mobile, profileImage } = req.body;

    // Check if email already exists
    const existingUser = await Students.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create a new student instance
    const newStudent = new Students({
      name,
      email,
      hobbies,
      gender,
      mobile,
      profileImage,
    });
    console.log(`newStudent: ${newStudent}`);
    // Save the student to the database
    await newStudent.save();

    res.status(201).json({ message: "Student Added Successfully", newStudent });
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
router.post("/getStudents", async (req, res) => {
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
      return res.status(404).json({ message: "User Not Authenticated" });
    }

    const students = await Students.find();
    console.log(`students: ${students}`);
    res.json(students);
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

// router.post(
//   "/imgUpload",
//   upload.single("uploaded_file"),
//   async function (req, res) {
//     try {
//       if (!req.file) {
//         console.log(`res: ${req}`);
//         return res.status(400).json({ message: "No file uploaded" });
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// );

router.post("/studentsDelete", async (req, res) => {
  const { id } = req.body;
  console.log(id);
  try {
    // Check if the user exists
    const user = await Students.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Students not found" });
    }

    // Delete the user from the database
    await Students.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/editStudents/:studentId", async (req, res) => {
  try {
    // Extract the student from the URL parameter
    const { studentId } = req.params;

    // Fetch the ride with the specified ID from the MongoDB collection using your Mongoose model
    const student = await Students.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: "student not found" });
    }

    // Iterate through the fields in the request body and update only the changed ones
    for (const key in req.body) {
      if (req.body.hasOwnProperty(key) && student[key] !== req.body[key]) {
        student[key] = req.body[key];
      }
    }

    // Save the updated ride data
    await student.save();

    // Respond with the updated ride data
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/studentById", async (req, res) => {
  const { id } = req.body;

  try {
    // Find the student by ID
    const student = await Students.findOne({ _id: id });
    if (!student) {
      return res.status(404).json({ message: "Students not found" });
    }
    return res.status(200).json({ data: student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
