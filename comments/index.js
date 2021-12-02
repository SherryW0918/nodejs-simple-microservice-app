const express = require('express');
const { randomBytes } = require('crypto');
const  bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(bodyParser.json()); // make sure the request passed appropriately
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments',(req,res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

//新增Comment
app.post('/posts/:id/comments',async (req,res) => {

    const {content} =req.body ;

    const commentId = randomBytes(4).toString('hex');

    const comments = commentsByPostId[req.params.id] || [];
    comments.push({id : commentId , content : content, status : "pending"});

    commentsByPostId[req.params.id] = comments;

    await axios.post('http://event-bus-srv:4005/events',{
        type : 'CommentCreated',
        data: {
            id :commentId,
            content,
            postId : req.params.id,
            status : "pending"
        }
    });

    res.status(201).send(commentsByPostId[req.params.id]);
});


//更新Comment状态
app.post('/events',  async (req,res) =>{

    console.log('Received Event: ',req.body.type);

    const {type, data} = req.body;

    if(type === 'CommentModerated'){

        const {postId , id ,status, content} =data;

        const comments = commentsByPostId[postId];

        const comment = comments.find(comment =>{
            return comment.id === id;
        });

        comment.status = status;

        await axios.post('http://event-bus-srv:4005/events',{

            type : 'CommentUpdated',
            data : {
                id : id,
                postId : postId,
                status,
                content : content
            }
        });
    }

    res.send({});
})

app.listen(4001, ()=>{
    console.log('Listenning on 4001');
})