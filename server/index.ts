import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Healthy Server",
  });
});

app.listen(3000, () => {
  console.log("server is listening on port 3000");
});
