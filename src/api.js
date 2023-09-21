import express from 'express';
import { log, highlight, note } from './log.js';
import git from 'git-client';
import fs from 'fs';
let api = express.Router();

api.get('/data', async (req, res) => {
    let repoPath = req.query.repo;
    if (!repoPath) {
        return res
            .status(400)
            .append('Content-Type', 'application/json')
            .send({ error: 'repo parameter required' });
    }
    if (!fs.existsSync(repoPath)) {
        return res
            .status(404)
            .append('Content-Type', 'application/json')
            .send({ error: `not found (${repoPath})` });
    }

    let gitRepo = repoPath + '/.git';
    if (!fs.existsSync(gitRepo)) {
        return res
            .status(400)
            .append('Content-Type', 'application/json')
            .send({ error: `not a git project root (${repoPath})` });
    }

    let folder = req.query.folder;
    if (!!folder && !fs.existsSync(repoPath + '/' + folder)) {
        return res
            .status(404)
            .append('Content-Type', 'application/json')
            .send({ error: `not found (${folder})` });
    }

    let all = req.query.all === 'true';
    let branch = req.query.branch;

    let repo = new git.Git({ gitDir: gitRepo });
    let gitargs = ['--date=short', '--pretty=format:%ad', '--no-merges'];

    if (all) {
        gitargs.push('--all');
    } else if (branch) {
        let defaultBranch = await getDefaultBranch(repo);
        if (defaultBranch != '' && defaultBranch != branch) {
            log.info("Default Branch " + defaultBranch);
            let ancestor = await oldestAncestor(repo, defaultBranch, branch);
            if (ancestor) {
                let range = `${ancestor}..origin/${branch}`;
                log.info(`Range: ${range}`);
                gitargs.push(range)
            } else {
                log.warn(`Unable to get commit range for ${branch} logging everything`);
                gitargs.push(`origin/${branch}`)
            }
            log.info();
        }
    }

    if (!!folder) {
        gitargs.push('--', folder);
    }

    log.info('git log', ...gitargs);
    let commitDates = [];
    
    try {
        commitDates = (await repo.log(...gitargs)).split(/\r?\n/);
    } catch(e) {
        return res
            .status(400)
            .append('Content-Type', 'application/json')
            .send({ error: e });
    }

    log.info(`Total Commits: ${commitDates.length}`);

    let counts = commitDates.reduce((acc, cur) => {
        acc[cur] = (acc[cur] || 0) + 1;
        return acc;
    }, {});

    res.json(counts);
});

const getDefaultBranch = async (repo) => {
    let branch = '';
    try {
        branch = await repo.symbolicRef('refs/remotes/origin/HEAD');
        // result will be something like: refs/remotes/origin/main
        branch = branch.replace('refs/remotes/origin/','');
    } catch(e) {
        log.error("Unable to get default branch. " + e);
    }
    return branch;
}

const oldestAncestor = async (repo, defaultBranch, branch) => {
    let defaultBranchRevList = await getRevList(repo, defaultBranch);
    let branchRevList = await getRevList(repo, branch);

    if (branchRevList.length && defaultBranchRevList.length) {
        defaultBranchRevList = defaultBranchRevList.reverse();
        branchRevList = branchRevList.reverse();

        for (let i = 0; i < branchRevList.length; ++i) {
            if (defaultBranchRevList[i] != branchRevList[i]) {
                return defaultBranchRevList[i-1];
            }
        }
    }
    return '';
}

const getRevList = async (repo, branch) => {
    try {
        const result = await repo.revList('--first-parent', 'origin/' + branch);
        const revs = result.split(/\r?\n/);
        return revs;
    } catch(e) {
        return [];
    }
}

export default api;
