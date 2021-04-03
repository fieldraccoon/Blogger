const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var path = require('path')
var handlePost = require("./modules/handlePost")
const _ = require("lodash")
const mongoose = require("mongoose")

const app = express();
const bcrypt = require('bcrypt')

app.use(express.json())
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/public')));

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});




const postSchema = {
    title: String,
    content: String
  };

const Post = mongoose.model("Post", postSchema);

let users = [];
let posts = [];
app.get("/", (req,res) => {
    
         res.render("home", {
             posts: posts,
         })
});
app.get("/users", (req,res) => {
  res.json(users)
});

app.post("/register", async (req,res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = { name: req.body.username, password: hashedPassword }
    users.push(user)
    console.log(users)
    res.redirect("/")

    res.status(201).send()
  } catch {
    res.status(500).send()
  }
})

app.post('/login', async (req, res) => {
  const user = users.find(user => user.name === req.body.username)
  if (user == null) {
    return res.status(400).send('Cannot find user')
  }
  try {
    if(await bcrypt.compare(req.body.password, user.password)) {
      let isUserLoggedIn = true
      console.log(isUserLoggedIn)
      res.render("/")
    } else {
      let isUserLoggedIn = false
      res.send('Not Allowed')
      console.log(isUserLoggedIn)

    }
  } catch {
    res.status(500).send()
  }
})

app.get("/create", (req,res) => {
    res.render("create");

})

app.post("/create", (req,res) => {
    // const post = {
    //     title: req.body.title,
    //     content: req.body.content
    // }
    
        const post = {
        title: req.body.title,
        content: req.body.content
    }
    const mongoPost = new Post({
                title: req.body.postTitle,
                 content: req.body.postBody
               });
    
    
    posts.push(post)
    res.redirect("/")

});
app.get("/posts", (req,res) => {
     res.render("postsPage", {
         posts: posts
     });
});


app.get("/posts/:postName", function(req, res){
    const requestedTitle = _.lowerCase(req.params.postName);
  
    posts.forEach(function(post){
      const storedTitle = _.lowerCase(post.title);
  
      if (storedTitle === requestedTitle) {
        res.render("post", {
          title: post.title,
          content: post.content
        });
      }
    });
  
  });

app.get("/login", (req,res) => {
    res.render("login")
});

app.get("/register", (req,res) => {
    res.render("register")
});

app.listen(3000, () => {
    console.log("Running server on port 3000")
});