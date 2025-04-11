require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
// const db = "mongodb://localhost:27017/test6";
const db = process.env.DATABASE_URI;
const port = process.env.PORT || 4000;
const cookieParser = require("cookie-parser");
const UserModel = require("./model/UserModel");
const PostModel = require("./model/PostModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v2 } = require("cloudinary");

const secret = process.env.SECRET;

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

app.use(
  cors({
    credentials: true,
    origin: ["https://mybloginghaedr.netlify.app", "http://localhost:3000"],
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "5mb" }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

// main app
// auth
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const findUser = await UserModel.findOne({ username });
    if (findUser) {
      return res.status(400).json("username already registered");
    }
    const userDoc = await UserModel.create({
      username,
      password: bcrypt.hashSync(password, 10),
    });
    res.json(userDoc);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const userDoc = await UserModel.findOne({ username });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);

    if (passOk) {
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie("token", token, { sameSite: "none", secure: true }).json({
          id: userDoc._id,
          username,
        });
      });
    } else {
      return res.status(400).json("wrong credintioals");
    }
  } else {
    return res.status(400).json("user not found");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  try {
    jwt.verify(token, secret, {}, (err, info) => {
      if (err) throw err;
      res.json(info);
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

app.post("/logout", (req, res) => {
  try {
    res.cookie("token", "").json("ok");
  } catch (error) {
    res.status(400).json(error.message);
  }
});
// posts
app.post("/post", async (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body;
    let { img } = req.body;
    if (img) {
      const uploadedResponse = await v2.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }
    const postDoc = await PostModel.create({
      title,
      summary,
      content,
      cover: img,
      author: info.id,
    });
    res.json(postDoc);
  });
});

app.put("/post", async (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content } = req.body;
    const postDoc = await PostModel.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json("you are not the author");
    }
    let { img } = req.body;
    if (img) {
      if (postDoc.cover) {
        await v2.uploader.destroy(postDoc.cover.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await v2.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    await postDoc.updateOne({
      title: title || postDoc.title,
      summary: summary || postDoc.summary,
      content: content || postDoc.content,
      cover: img || postDoc.cover,
    });
    res.json(postDoc);
  });
});

app.get("/post", async (req, res) => {
  res.json(
    await PostModel.find({})
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await PostModel.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});

app.delete("/post/:id", async (req, res) => {
  const { token } = req.cookies;
  try {
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err;
      const { id } = req.params;
      const postDoc = await PostModel.findById(id);

      const isAuthor =
        JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(400).json("you are not the author");
      }
      if (postDoc.cover) {
        await v2.uploader.destroy(postDoc.cover.split("/").pop().split(".")[0]);
      }

      await postDoc.delete({});
      res.json("post deleted successfule");
    });
  } catch (error) {
    res.status(400).json(error);
  }
});
// end main app

app.all("*", (req, res) => {
  res.json({ message: "404 Not Found" });
});

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`http://localhost:${port}/`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
