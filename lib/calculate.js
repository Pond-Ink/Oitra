const fs = require('fs');
const path = require('path');
const yaml = require('yamljs');
const chalk = require('chalk');
const moment = require('moment');

const calcRating = require('./rating.js');

function getRating(who) {
    if (!fs.existsSync(path.join('data', 'oiers', `${who}.json`))) {
        return 1500;
    } else {
        return JSON.parse(fs.readFileSync(path.join('data', 'oiers', `${who}.json`)).toString()).rating;
    }
}

function setRating(who, contest, rank, rating) {
    if (!fs.existsSync(path.join('data', 'oiers'))) {
        if (!fs.existsSync(path.join('data'))) {
            fs.mkdirSync(path.join('data'));
        }
        fs.mkdirSync(path.join('data', 'oiers'));
    }
    let data = fs.existsSync(path.join('data', 'oiers', `${who}.json`)) ? 
        JSON.parse(fs.readFileSync(path.join('data', 'oiers', `${who}.json`)).toString()) : { rating: 1500, history: [] };
    data.rating = rating;
    data.history.push({
        contest: contest,
        rank: rank,
        rating: rating
    });
    fs.writeFileSync(path.join('data', 'oiers', `${who}.json`), JSON.stringify(data), 'utf-8');
}

function setContest(contest, title, date, items, result) {
    if (!fs.existsSync(path.join('data', 'contests'))) {
        if (!fs.existsSync(path.join('data'))) {
            fs.mkdirSync(path.join('data'));
        }
        fs.mkdirSync(path.join('data', 'contests'));
    }
    let data = {
        title: title,
        date: date,
        items: items,
        result: result
    };
    fs.writeFileSync(path.join('data', 'contests', `${contest}.json`), JSON.stringify(data), 'utf-8');

    let list = fs.existsSync(path.join('data', 'contests', '_data.json')) ?
        JSON.parse(fs.readFileSync(path.join('data', 'contests', '_data.json')).toString()) : [];
    list.push(contest);
    fs.writeFileSync(path.join('data', 'contests', '_data.json'), JSON.stringify(list), 'utf-8');
}

function calculate(contest) {
    try {
        if (fs.existsSync(path.join('data', 'contests', `${contest}.json`))) {
            console.log(chalk.red('[Error]'), `Already calculated the contest ${contest}.`);
            return;
        }

        if (!contest.endsWith('.yaml') && !contest.endsWith('.yml')) {
            contest = `${contest}.yaml`;
        }
        if (!fs.existsSync(path.join('source', contest))) {
            console.log(chalk.red('[Error]'), `No such file "${contest}" found in the directory "./source".`);
            return;
        }

        let title, date, items, result;

        const res = yaml.load(path.join('source', contest));
        title = res.title;
        date = moment(res.date);
        if (res.items instanceof Array) {
            items = res.items;
        } else {
            items = [];
        }
        if (res.result instanceof Object) {
            result = [];
            for (const who in res.result) {
                result.push({
                    who: who,
                    value: res.result[who].value,
                    data: res.result[who].data
                });
            }
        } else if (res.result instanceof Array) {
            result = [];
            for (const piece of res.result) {
                result.push({
                    who: piece.who,
                    value: piece.value,
                    data: piece.data
                });
            }
        } else {
            result = [];
        }

        result.sort((x, y) => y.value - x.value);

        for (let i = 0; i < result.length; i++) {
            if (i == 0 || result[i].value != result[i - 1].value) {
                result[i].rank = i + 1;
            } else {
                result[i].rank = result[i - 1].rank;
            }
        }

        let oldRatings = [];
        for (let i = 0; i < result.length; i++) {
            oldRatings.push({
                user: result[i].who,
                rank: result[i].rank,
                currentRating: getRating(result[i].who)
            });
        }
        let newRatings = calcRating(oldRatings);

        contest = contest.replace(/.ya?ml$/, '');
        for (let i = 0; i < newRatings.length; i++) {
            setRating(newRatings[i].user, {
                id: contest,
                title: title,
                date: date.format('YYYY-MM-DD HH:mm')
            }, newRatings[i].rank, newRatings[i].currentRating);
            result[i].rating = { old: oldRatings[i].currentRating, new: newRatings[i].currentRating };
        }
        setContest(contest, title, date.format('YYYY-MM-DD HH:mm'), items, result);

    } catch (error) {
        console.log(error);
        console.log(chalk.red('[Error]'), 'Unexpected Error.');
    }
}

module.exports = calculate;