const http = require('http');
const fs = require('fs');
const Url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHTML = require('sanitize-html');

var mysql      = require('mysql');

var db = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : '1234',
    database : 'opentutorials'
  });
   
  db.connect();

// const templateControl = () => {
//     const control = `<a href="/create">create</a> <a href="/update">update</a>`
//     return control
// }


const app = http.createServer((req, res) => {
    const _url = req.url;
    var queryData = Url.parse(_url, true).query;
    const pathname = Url.parse(_url, true).pathname;

    console.log(Url.parse(_url, true));
    // if (_url == '/') {
    //     title=Welcome;
    // }
    // if (_url == '/favicon.ico') {
    //     return res.writeHead(404);
    // }

    if(pathname === '/') {
        if(queryData.id === undefined) {
            fs.readdir('./data', (err, filelist) => {
                var title = 'Welcome';
                var description = 'Hello, Node js';
                var list = template.list(filelist);
                var templateHTML = template.HTML(title, list, 
                    `<h2>${title}</h2><p>${description}</p>`, '<a href="/create">create</a>');
                res.writeHead(200);
                res.end(templateHTML);
            });
        } else {
            fs.readdir('./data', (err, filelist) => {
                const filteredId = path.parse(queryData.id).base;
                fs.readFile(`./data/${filteredId}`, (err, description) => {
                    var title = queryData.id;
                    var sanitizedTitle = sanitizeHTML(title);
                    var sanitizedDescription = sanitizeHTML(description);
                    var list = template.list(filelist);
                    var templateHTML = template.HTML(sanitizedTitle, list, 
                        `<h2>${title}</h2><p>${sanitizedDescription}</p>`,
                        `<a href="/create">create</a> <a href="/update?id=${sanitizedTitle}">update</a>
                         <form action="/delete_process" method="post">
                            <input type="hidden" name="id" value="${sanitizedTitle}">
                            <input type="submit" value="delete">
                        </form>`);
                    res.writeHead(200);
                    res.end(templateHTML);
                });
            });
        } 
    } else if(pathname === '/create') {
        fs.readdir('./data', (err, filelist) => {
            var title = 'Welcome';
            var description = 'Hello, Node js';
            var list = template.list(filelist);
            var templateHTML = template.HTML(title, list, `
            <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                    <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>
            `, '');
            res.writeHead(200);
            res.end(templateHTML);
        });
    } else if(pathname === "/create_process") {
        var body = '';
        req.on('data', (data) => {
            body = body + data;
        });
        req.on('end', () => {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
                res.writeHead(301, {'location': `/?id=${title}`});
                res.end();
            });
        });
        
    } else if(pathname === '/update') {
        fs.readdir('./data', (err, filelist) => {
            const filteredId = path.parse(queryData.id).base;
            fs.readFile(`./data/${filteredId}`, (err, description) => {
                var title = queryData.id;
                var list = template.list(filelist);
                var templateHTML = template.HTML(title, list, 
                    `
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value=${title}>
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="description" placeholder="description" value="${description}"></textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                    `,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
                res.writeHead(200);
                res.end(templateHTML);
            });
        });
    } else if(pathname === "/update_process") {
        var body = '';
        req.on('data', (data) => {
            body = body + data;
        });
        req.on('end', () => {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            console.log(post);
            fs.rename(`data/${id}`, `data/${title}`, (err) => {
                fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
                    res.writeHead(301, {'location': `/?id=${title}`});
                    res.end();
                });
            })
        });
        
    } else if(pathname === "/delete_process") {
        var body = '';
        req.on('data', (data) => {
            body = body + data;
        });
        req.on('end', () => {
            var post = qs.parse(body);
            var id = post.id;
            const filteredId = path.parse(id).base;
            fs.unlink(`data/${filterdId}`, (err) => {
                res.writeHead(302, {'location': '/'});
                res.end();
            });
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

app.listen(3002);