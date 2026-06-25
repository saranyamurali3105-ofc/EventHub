const mongoose = require("mongoose");

const uri = "mongodb+srv://sandhiya:sandy@cluster0.anypy8q.mongodb.net/eventshubDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("✅ Connected successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection failed:");
    console.error(err);
    process.exit(1);
  });