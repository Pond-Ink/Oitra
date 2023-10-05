const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function getTitle(x) {
    if (x < 1200) return 'Newbie';
    else if (x < 1400) return 'Pupil';
    else if (x < 1600) return 'Specialist';
    else if (x < 1900) return 'Expert';
    else if (x < 2100) return 'Candidate Master';
    else if (x < 2300) return 'Master';
    else if (x < 2400) return 'International Master';
    else if (x < 2600) return 'Grandmaster';
    else if (x < 3000) return 'International Grandmaster';
    else return 'Legendary Grandmaster';
}

function getColor(x) {
    if (x < 1200) return 'gray';
    else if (x < 1400) return 'green';
    else if (x < 1600) return '#03a89e';
    else if (x < 1900) return 'blue';
    else if (x < 2100) return '#a0a';
    else if (x < 2300) return '#ff8c00';
    else if (x < 2400) return '#ff8c00';
    else if (x < 2600) return 'red';
    else if (x < 3000) return 'red';
    else return 'red';
}

function colorName(name, rating) {
    if (rating >= 3000) return `<font style="color:red;font-weight:bold"><font style="color:black">${name[0]}</font>${name.substring(1)}</font>`;
    else return `<font style="color:${getColor(rating)};font-weight:bold">${name}</font>`;
}

function colorRating(rating) {
    return `<font style="color:${getColor(rating)};font-weight:bold">${rating}</font>`;
}

function int2string(x) {
    if (x < 0) return x.toString();
    else if (x > 0) return '+' + x.toString();
    else return '0';
}

function colorRatingChange(ratingChange) {
    if (ratingChange > 0) return `<font style="color:green;font-weight:bold">${int2string(ratingChange)}</font>`;
    else return `<font style="color:gray;font-weight:bold">${int2string(ratingChange)}</font>`;
}

function getRemark(oldRating, newRating) {
    if (getTitle(oldRating) == getTitle(newRating)) return '';
    else return `Became ${colorName(getTitle(newRating), newRating)}`;
}

function output(contest) {
    try {
        if (!fs.existsSync(path.join('data', 'contests', `${contest}.json`))) {
            console.log(chalk.red('[Error]'), `There isn't a contest ${contest}.`);
            return;
        }
    
        const res = JSON.parse(fs.readFileSync(path.join('data', 'contests', `${contest}.json`)).toString());
    
        let ans = `## ${res.title}\n\n${res.date}\n\n`;
        ans += '| rk | Who ';
        for (let i = 0; i < res.items.length; i++) {
            ans += `| ${res.items[i]} `;
        }
        ans += '| Δ | Rating | Remark |\n';
        ans += '| :---: | :---: ';
        for (let i = 0; i < res.items.length; i++) {
            ans += `| :---: `;
        }
        ans += '| :---: | :---: | :---: |\n';
        for (let i = 0; i < res.result.length; i++) {
            ans += `| ${res.result[i].rank} | ${colorName(res.result[i].who, res.result[i].rating.old)} `;
            for (let j = 0; j < res.result[i].data.length; j++) {
                if (res.result[i].data[j] instanceof Array) {
                    ans += `| ${res.result[i].data[j][0]}`;
                    for (let k = 1; k < res.result[i].data[j].length; k++) {
                        ans += `<br><small>${res.result[i].data[j][k]}</small>`
                    }
                    ans += ' ';
                } else {
                    ans += `| ${res.result[i].data[j] || ''} `;
                }
            }
            ans += `| ${colorRatingChange(res.result[i].rating.new - res.result[i].rating.old)} `;
            ans += `| ${colorRating(res.result[i].rating.old)}→${colorRating(res.result[i].rating.new)} `
            ans += `| ${getRemark(res.result[i].rating.old, res.result[i].rating.new)} `
            ans += `|\n`;
        }
    
        if (!fs.existsSync(path.join('output'))) {
            fs.mkdirSync(path.join('output'));
        }
        fs.writeFileSync(path.join('output', `${contest}.md`), ans, 'utf-8');

    } catch (error) {
        console.log(error);
        console.log(chalk.red('[Error]'), 'Unexpected Error.');
    }
}

module.exports = output;