const http = require('http');
const fs = require('fs');
const Url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js');
const path = require('path');


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

    // console.log(Url.parse(_url, true));
    // if (_url == '/') {
    //     title=Welcome;
    // }
    // if (_url == '/favicon.ico') {
    //     return res.writeHead(404);
    // }

    if(pathname === '/') {
        if(queryData.id === undefined) {
            db.query(`SELECT * FROM topic`, (err, topics) => {
                var title = 'Welcome';
                var description = 'Hello, Node js';
                var list = template.list(topics);
                var templateHTML = template.HTML(title, list, 
                    `<h2>${title}</h2><p>${description}</p>`, '<a href="/create">create</a>');
                res.writeHead(200);
                res.end(templateHTML);
            });
        } else {
            db.query(`SELECT * FROM topic`, (err, topics) => {
                if (err) { 
                    throw err; 
                };
                db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id] ,(err2, topic) => {
                    if (err2) { 
                        throw err2; 
                    };
                    var title = topic[0].title;
                    var description = topic[0].description;
                    var list = template.list(topics);
                    var templateHTML = template.HTML(title, list,
                        `<h2>${title}</h2><p>${description}</p>`,
                        `<a href="/create">create</a> <a href="/update?id=${queryData.id}">update</a>
                         <form action="/delete_process" method="post">
                            <input type="hidden" name="id" value="${queryData.id}">
                            <input type="submit" value="delete">
                        </form>`);
                    res.writeHead(200);
                    res.end(templateHTML);
                })


            })
        } 
    } else if(pathname === '/create') {
        db.query(`SELECT * FROM topic`, (err, topics) => {
            if (err) { 
                throw err; 
            };
            
            var title = 'Create';
            var list = template.list(topics);
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
            `, '');;
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
            db.query(`INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`
                    ,[post.title, post.description, 1], (err, result) => {
                if(err) { throw err };
                res.writeHead(302, {Location: `/?id=${result.insertId}`});
                res.end();
                });
        });
        
    } else if(pathname === '/update') {
        
        db.query(`SELECT * FROM topic`, (err, topics) => {
            if (err) { 
                throw err; 
            };
            db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], (err2, data) => {
                var title = data[0].title;
                var description = data[0].description;
                var list = template.list(topics);
                var templateHTML = template.HTML(title, list, `
                <form action="/create_process" method="post">
                    <input type="hidden" name="id" value=${title}>
                    <p><input type="text" name="title" placeholder="${title}"></p>
                    <p>
                        <textarea name="description" placeholder="${description}"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `, `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);;
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
            console.log(post);
            db.query(`UPDATE topic SET title=?, description=?, author_id=1 WHERE id=?`
                    ,[post.title, post.description, post.id], (err, result) => {
                if(err) { throw err };
                res.writeHead(302, {Location: `/?id=${post.id}`});
                res.end();
                });
        });
        
    } else if(pathname === "/delete_process") {
        var body = '';
        req.on('data', (data) => {
            body = body + data;
        });
        req.on('end', () => {
            var post = qs.parse(body);
            db.query(`DELETE FROM topic WHERE id=?`, [post.id], (err, result) => {
                if(err) { throw err };
                res.writeHead(302, {Location: '/'});
                res.end();
            })
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

app.listen(3002);