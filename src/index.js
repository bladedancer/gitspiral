import { spinner } from './spinner.js';
import config from './config.js';
import api from './api.js';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { log, highlight, note } from './log.js';

const app = express()
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function init() {
}

app.use(express.static('client/dist'));
app.use('/api', api);

app.listen(config.PORT, async () => {
    log.info(`Git Spiral listening on port ${config.PORT}`)
    init();
});
