const path = require('path');
const express = require('express');
const chalk = require('chalk');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();

app.use(express.static(publicPath));



app.listen(port, () => {
    console.log(chalk.green(`Server is up on port ${port}!`));
});