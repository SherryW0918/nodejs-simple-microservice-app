const express = require('express');
const  bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(bodyParser.json()); // make sure the request passed appropriately
app.use(cors());

const posts = {
    'j12j33':{
        id:'j12j33',
        title : 'post title',
        comments : [
            { id : 'klj34', content : 'this is a comment!'}
        ]
    },

    'j13j33':{
        id:'j13j33',
        title : 'post title2',
        comments : [
            { id : 'klj35', content : 'this is a another comment!'}
        ]
    }
};

//接收外界http请求
app.get('/posts',(req,res) => {
    res.send(posts);
});

//接收来自http的请求

//存在两种type 1. PostCreated 2.CommentCreated 3.CommentUpdated
app.post('/events',(req,res)=>{
    const {type, data} = req.body

    handleEvent(type,data);

    res.send({});
})

app.listen(4002, async()=>{

    console.log("Listening on 4002");

  try {
    const res = await axios.get("http://event-bus-srv:4005/events");
 
    for (let event of res.data) {
      console.log("Processing event:", event.type);
 
      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }

});

const handleEvent = (type, data) => {
    if(type === 'PostCreated'){
        const {id,title} = data;

        posts[id] = {id,title,comments : []}
    }

    else if(type === 'CommentCreated'){
        const {id,content ,postId,status} = data;

        const post = posts[postId] ;

        post.comments.push({id,content,status});
    }

    else if(type === 'CommentUpdated'){
        const {id , content , postId ,status} =data;

        const post = posts[postId];

        const comment = post.comments.find(comment => {
            return comment.id === id;
        })

        comment.status = status;
        comment.content = content;
    }
}