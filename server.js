const express = require('express');
const app = express();
const history = require('connect-history-api-fallback');

app.use(history());
app.use(express.static(__dirname + "/dist"));
app.listen(process.env.PORT); 