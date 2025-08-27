const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Factory ERP API is running.");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
