const fs = require('fs');
const path = require('path');

function getLatestContest() {
    if (!fs.existsSync(path.join('data', 'contests', '_data.json'))) {
        return null;
    } else {
        let list = JSON.parse(fs.readFileSync(path.join('data', 'contests', '_data.json')).toString());
        return list[list.length - 1];
    }
}

function setRating(who, contest) {
    if (!fs.existsSync(path.join('data', 'oiers', `${who}.json`))) {
        return;
    }
    
    let data = JSON.parse(fs.readFileSync(path.join('data', 'oiers', `${who}.json`)).toString());
    if (data.history[data.history.length - 1].contest.id == contest) {
        if (data.history.length == 1) {
            fs.unlinkSync(path.join('data', 'oiers', `${who}.json`));
        } else {
            data.history[data.history.length - 1].pop();
            data.rating = data.history[data.history.length - 1].rating;
            fs.writeFileSync(path.join('data', 'oiers', `${who}.json`), JSON.stringify(data), 'utf-8');
        }
    }
}

function setContest(contest) {
    if (fs.existsSync(path.join('data', 'contests', `${contest}.json`))) {
        fs.unlinkSync(path.join('data', 'contests', `${contest}.json`))
    }

    let list = fs.existsSync(path.join('data', 'contests', '_data.json')) ?
        JSON.parse(fs.readFileSync(path.join('data', 'contests', '_data.json')).toString()) : [];
    if (list[list.length - 1] == contest) {
        list.pop();
    }
    fs.writeFileSync(path.join('data', 'contests', '_data.json'), JSON.stringify(list), 'utf-8');
}

function rollback() {
    let latest = getLatestContest();
    if (!latest) {
        console.log(chalk.red('[Error]'), `There aren't any contests.`);
        return;
    }

    if (!fs.existsSync(path.join('data', 'contests', `${latest}.json`))) {
        return;
    }

    let result = JSON.parse(fs.readFileSync(path.join('data', 'contests', `${latest}.json`)).toString()).result;
    for (let i = 0; i < result.length; i++) {
        setRating(result[i].who, latest);
    }
    setContest(latest);
}

module.exports = rollback;