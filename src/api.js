import express from 'express';
import { log, highlight, note } from './log.js';
import git from 'git-client';
import fs from 'fs';
let api = express.Router();

api.get('/data', async (req, res) => {
    let repoPath = req.query.repo;
    if (!repoPath) {
        return res.status(400)
            .append("Content-Type", "application/json")
            .send({"error": "repo parameter required"});
    }
    if (!fs.existsSync(repoPath)) {
        return res.status(404)
            .append("Content-Type", "application/json")
            .send({"error": `not found (${repoPath})`});
    }

    let gitRepo = repoPath + "/.git";
    if (!fs.existsSync(gitRepo)) {
        return res.status(400)
            .append("Content-Type", "application/json")
            .send({"error": `not a git project root (${repoPath})`});
    }

    let folder = req.query.folder || ".";
    if (!fs.existsSync(repoPath + "/" + folder)) {
        return res.status(404)
            .append("Content-Type", "application/json")
            .send({"error": `not found (${folder})`});
    }

    let repo = new git.Git({gitDir: gitRepo})
    let commitDates = [];
    if (!folder) {
        commitDates = (await repo.log("--date=short", "--pretty=format:%ad", "--", folder)).split(/\r?\n/);
    } else {
        commitDates = (await repo.log("--date=short", "--pretty=format:%ad")).split(/\r?\n/);
    }

    let counts = commitDates.reduce((acc, cur) => {
        acc[cur] = (acc[cur] || 0) + 1;
        return acc;
    }, {});

    res.json(counts);
});

export default api;
