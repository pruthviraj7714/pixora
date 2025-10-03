import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes";
import postRouter from "./routes/post.routes";
import adminRouter from "./routes/admin.routes";
import cloudinaryRouter from "./routes/cloudinary.route";
import notificationRouter from "./routes/notification.routes";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Healthy Server",
  });
});

app.use('/user', userRouter);
app.use('/posts', postRouter);
app.use('/admin', adminRouter);
app.use('/cloudinary', cloudinaryRouter);
app.use('/notifications', notificationRouter);

app.listen(3001, () => {
  console.log("server is listening on port 3001");
});
