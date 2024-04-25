const express = require("express");
const mongoose = require("mongoose");

const app = express();

// MongoDB Atlas connection
const MONGODB_URI =
  "mongodb+srv://vishalrahangdale14:LSFCDuIbwxBK6u84@cluster0.7fdoxzo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const route = require("./Routes/routes");

app.use("/api", route);


const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
