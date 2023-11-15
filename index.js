const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const app = express();
const comments = [
    { id: 1, username: 'Filippos', text: 'lorem ipsum' },
    { id: 2, username: 'Anton', text: 'lorem ipsum' },
    { id: 3, username: 'Susan', text: 'lorem ipsum' },
    { id: 4, username: 'Ntolmadakia', text: 'lorem ipsum' },
    { id: 5, username: 'Xiano', text: 'lorem ipsum' }
];
//the use method is being called on every single request that happens from the client.
// By default the body of a post request is undefined. (wtf!?) You need a middleware to get (the content)/populated  
//https://stackoverflow.com/questions/23259168/what-are-express-json-and-express-urlencoded 
//Middleware functions are those functions that are called between proccessing your request and before sending the response.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method')); // The forms in html support only get and post methods. When using the method-override module you can override that 
// by giving a string such as 'DELETE' or 'PATCH' and it will transform it for you. If you want to do update on server side you need to use also the
// post method alternatively it won't work
app.set('views', path.join(__dirname, 'views')); // makes the path an absolute path so that it is accessible from everywhere
app.set('view engine', 'ejs');
// diference between res.send & res.render is that with send we can send strings, html code or json obsjects back
// while when using render we can return with the response a view. It renders a view and gives a rendered html string back
app.get('/tacos', (request, response) => {
    response.send('GET /tacos response');
})

app.post('/tacos', (request, response) => {
    const { meat, qty: num } = request.body;
    console.log(meat, num);
    response.send(`here are your ${num} ${meat}`);
})

app.listen(3000, () => {
    console.log('Listening on port 3000');
})

app.get('/comments', (request, response) => {
    response.render('comments/index', { comments });
})

// We create 2 routes for creating new comments. The one will serve the route to the form and it follows the .../new pattern
// and when the submit is happened it needs another route to handle the incomming data.
app.get('/comments/new', (request, response) => {
    response.render('comments/new');
})
// In the new.ejs you create a form that will do a post and it should happen in the /comments.
// Then the once the client has submit the form the server will receive the the request and see that it did receive a post request on the /comments
// path and the it will execute the code below
// On submit, send the form-data to a file named "/comments" (to process the input):
app.post('/comments', (request, response) => {
    const { username, comment } = request.body; // body is also an object with 2 parameters
    //response.send('it works'); if we use this response then we are at the response of that post request.
    //We will see as URL is localhostxxx/comments and which is in the post phase. So if we refresh it will be retrigerred.
    //As we can notice the post/comments and the get/comments are similar beside the method.
    //When we call redirect then it automatically calls the get method and not the post

    ///redirect -> the client receives a 302 status code and then takes you from where you where and makes a get request to that specific path
    const item = { username, text: comment };
    const id = comments[comments.length - 1].id + 1;
    item.id = id;
    comments.push(item);
    response.redirect('/comments') // What needs to be done is, when the post is received from the backend to redirect to the other path 
})

app.get('/comments/:id', (request, response) => {
    //The request object gives us a params object params { id : 'xxxx' } where we can access the path parameter in our case id
    // We can access it by access it as an object with .id or by deconstructing it by doing const { id } = request.params;
    // its more or les the same.
    const id = request.params.id;
    const comment = comments.find(comment => comment.id === parseInt(id));
    console.log(comment);
    response.render('comments/show', { comment });
})

//Forms in html can only send get or post requests by default. They can't send patch or put requests to the server
app.get('/comments/:id/edit', (request, response) => {
    const { id } = request.params;
    const comment = comments.find(comment => comment.id === parseInt(id));
    response.render('comments/edit', { comment })
})

//post and patch have a body and patch can also have path parameter. Patch contains only the changes that should update a specific resource 
app.patch('/comments/:id', (request, response) => {
    const { id } = request.params;
    console.log(request.body);
    const newCommentText = request.body.comment;
    const comment = comments.find(comment => comment.id === parseInt(id));
    comment.text = newCommentText;
    response.redirect('/comments');
})

//follow same pattern as the the edit does. In this case we did not create a new path with html but we just added a form button which is basically the same in the show.ejs
app.delete('/comments/:id', (request, response) => {
    const id = request.params.id;
    const comment = comments.find(comment => comment.id === parseInt(id));
    comments.pop(comment);
    response.redirect('/comments');
})

