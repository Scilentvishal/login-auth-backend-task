const express = require("express");
const mongoose = require("mongoose");

// const bodyParser = require("body-parser");
const cors = require("cors");
const cookieparser = require("cookie-parser");

const app = express();

// MongoDB Atlas connection
const MONGODB_URI =
  "mongodb+srv://vishalrahangdale14:LSFCDuIbwxBK6u84@cluster0.7fdoxzo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const route = require("./Routes/routes");
app.use(express.json());
app.use(cookieparser());
app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000'
}))

app.use("/api", route);

app.use('/profile', express.static('upload/profile'));

app.get("/", (req, res)=>{
  res.send("Hello, world!");
})

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
