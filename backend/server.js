require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
// const db = "mongodb://localhost:27017/test15";
const db = process.env.DATABASE_URI;
const port = process.env.PORT || 4000;
const cookieParser = require("cookie-parser");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const uploadMiiddleware = multer({ dest: "uploads/" });
const { v2 } = require("cloudinary");

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const Post = require("./models/Post");

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

const salt = bcrypt.genSaltSync(10);
const secret = process.env.SECRET;

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"],
  })
);

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const finduser = await User.findOne({ username });
    if (finduser) {
      return res.status(400).json("username already use");
    }
    const UserDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.status(200).json(UserDoc);
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.status(400).json("wrong username or password");
    }
    passOk = bcrypt.compareSync(password, userDoc.password);
    if (!passOk) {
      return res.status(400).json("wrong username or password");
    }
    if (passOk) {
      jwt.sign(
        { username, id: userDoc._id },
        secret,
        {
          expiresIn: "15d",
        },
        (err, token) => {
          if (err) throw err;
          res
            .cookie("token", token, {
              maxAge: 15 * 24 * 60 * 60 * 1000,
              httpOnly: true, // prevent xss attacks cross-site scripting attacks
              sameSite: "strict",
            })
            .json({
              id: userDoc._id,
              username,
            });
        }
      );
    } else {
      res.status(400).json("worng credintials");
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/profile", async (req, res) => {
  const { token } = req.cookies;
  try {
    jwt.verify(token, secret, {
             }, (err, info) => {
      if (err) throw err;
      res.json(info);
    });
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/post", async (req, res) => {
  const { token } = req.cookies;
  jwt.verify(
    token,
    secret,
    {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent xss attacks cross-site scripting attacks
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    },
    async (err, info) => {
      if (err) throw err;
      const { title, summary, content } = req.body;
      let { img } = req.body;
      if (img) {
        const uploadedResponse = await v2.uploader.upload(img);
        img = uploadedResponse.secure_url;
      }
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: img,
        author: info.id,
      });
      res.json(postDoc);
    }
  );
});

app.put("/post", async (req, res) => {
  const { token } = req.cookies;
  jwt.verify(
    token,
    secret,
    {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent xss attacks cross-site scripting attacks
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    },
    async (err, info) => {
      if (err) throw err;
      const { id, title, summary, content } = req.body;
      const postDoc = await Post.findById(id);
      const isAuthor =
        JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(400).json("you are not the author");
      }
      let { img } = req.body;
      if (img) {
        if (postDoc.cover) {
          await v2.uploader.destroy(
            postDoc.cover.split("/").pop().split(".")[0]
          );
        }
        const uploadedResponse = await v2.uploader.upload(img);
        img = uploadedResponse.secure_url;
      }

      await postDoc.update({
        title: title || postDoc.title,
        summary: summary || postDoc.summary,
        content: content || postDoc.content,
        cover: img || postDoc.cover,
      });
      res.json(postDoc);
    }
  );
});

app.get("/post", async (req, res) => {
  const posts = await Post.find()
    .populate("author", ["username"])
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(posts);
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});

app.delete("/post/:id", async (req, res) => {
  const { token } = req.cookies;
  try {
    jwt.verify(
      token,
      secret,
      {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true, // prevent xss attacks cross-site scripting attacks
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
      },
      async (err, info) => {
        if (err) throw err;
        const { id } = req.params;
        const postDoc = await Post.findById(id);

        const isAuthor =
          JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
          return res.status(400).json("you are not the author");
        }
        if (postDoc.cover) {
          await v2.uploader.destroy(
            postDoc.cover.split("/").pop().split(".")[0]
          );
        }

        await postDoc.delete({});
        res.json("post deleted successfule");
      }
    );
  } catch (error) {
    res.status(400).json(error);
  }
});
app.all("/*", (req, res) => {
  res.status(404).json({ error: "404 page not found" });
});

mongoose
  .connect(db)
  .then(() => {
    app.listen(port, () => {
      console.log(`http://localhost:${port}/`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
