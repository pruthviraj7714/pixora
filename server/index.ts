import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes";
import postRouter from "./routes/post.routes";
import adminRouter from "./routes/admin.routes";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Healthy Server",
  });
});

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use('"/admin', adminRouter);

app.listen(3000, () => {
  console.log("server is listening on port 3000");
});
