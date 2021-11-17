const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//DATABASE CONNECTION
const mongoose = require('mongoose');
async function dbConn() {
    await mongoose.connect("mongodb://localhost:27017/realtime-commenting-system");
}

dbConn()
    .then(() => {
        console.log('db connected ...')
    })
    .catch((err) => {
        console.log(err.message);
    })

//MODELS
const Comment = require('./models/comment');

//ROUTES
app.post('/api/comments', (req, res) => {
    const { username, comment } = req.body;
    const newComment = new Comment({
        username, comment
    })

    newComment.save()
        .then((response) => {
            res.send(response)
        })
})

app.get('/api/comments', (req, res) => {
    Comment.find()
    .then((comments) => {
        res.send(comments)
    })
})


//LISTENING
const server = app.listen(port, () => {
    console.log("listening on port 3000")
});

let io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log(`New Connection: ${socket.id}`);

    //receive comment event from client
    socket.on('comment', (data) => {

        //SENDING DATA TO OTHER USERS
        data.time = Date();
        socket.broadcast.emit('comment', data);

        //RECEIVING TYPING EVENT FROM THE CLIENT 
        socket.on('typing', (data) => {
            socket.broadcast.emit('typing', data)
        })
    })
})