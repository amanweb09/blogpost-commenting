
let username;
let socket = io();

// JAB TAK USER NAME ENTER NHI KARTA TAB TK YEH PROMPT SHOW KRTE RAHO
do {
    username = prompt("Enter Your Name");
} while (!username);

const textarea = document.querySelector('#textarea');
const submitBtn = document.querySelector('#submit-btn');

const commentBox = document.querySelector('.comment_box');

submitBtn.addEventListener('click', (e) => {
    e.preventDefault();

    let comment = textarea.value;

    if (!comment) {
        return;
    }
    postComment(comment);
})

function postComment(comment) {
    //APPEND TO DOM
    let data = {
        username: username,
        comment: comment,
    }
    appendToDom(data);
    textarea.value = "";

    //BROADCAST
    broadcastComment(data)

    //STORE DATA IN DB
    syncWithDb(data)
}

function appendToDom(data) {
    let lTag = document.createElement('li');
    lTag.classList.add('comment', 'mb-3');

    let markup = `
    <div class="card border-light mb-3">
        <div class="card-body">
            <h5>${data.username}</h5>
            <p>${data.comment}</p>
            <div>
                <small>${moment(data.time).format('LT')}</small>
            </div>
        </div>
    </div>
    `

    lTag.innerHTML = markup;

    commentBox.prepend(lTag)    //PREPEND APPENDCHILD KA ULTA HOTA H I.E. YEH NEW COMMENT KO UPAR APPEND KREGA BUT APPENDCHILD NEW COMMENT KO BAD MAIN APPEND KREGA
}

function broadcastComment(data) {
    //socket
    socket.emit('comment', data)        //KOI B EVENT AND JO B DATA HUME PASS KRNA H
}

//RECEIVING DATA FROM SERVER
socket.on('comment', (data) => {
    appendToDom(data)
})


//RECEIVING TYPING EVENT FROM THE SERVER
let typingDiv = document.querySelector('.typing');
socket.on('typing', (data) => {
    typingDiv.innerText = `${data.username} is typing ... `
})

//TYPING EVENT
textarea.addEventListener('keyup', (e) => {
    socket.emit('typing', { username })
})


function syncWithDb(data) {
    const headers = {
        'Content-Type': 'application/json'
    }
    fetch('/api/comments', {
        method: "Post",
        body: JSON.stringify(data),
        headers
    })
    .then((res) => {
        res.json() .then((result) => {console.log(result)}) .catch((err) => {console.log(err);})  
    })
    .catch((err) => {
        console.log(err);
    })
}

function fetchComments() {
    fetch('/api/comments')
    .then(res => res.json())
    .then((result) => {
        result.forEach((comment) => {
            comment.time = comment.createdAt;
            appendToDom(comment)
        })
        // console.log(result)
    })
}

window.onload = fetchComments()