


const template = {
    HTML: function (title, list, body, control) {
     return `
     <!doctype html>
     <html>
         <head>
             <title>WEB1 - ${title}</title>
             <meta charset="utf-8">
         </head>
         <body>
             <h1><a href="/">WEB</h1>
             ${list}
             ${control}
             <p>${body}</p>
         </body>
     </html>
     `;
     },
     list: function(topics) {
         var list = '<ul>';
         var i = 0;
         while(i < topics.length) {
             list = list + `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`;
             i++;
         }
         list = list + '</ul>';
         return list;
     }
 }
 
 
 module.exports = template;