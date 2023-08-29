const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function int2string(x) {
    if (x < 0) return x.toString();
    else if (x > 0) return '+' + x.toString();
    else return '0';
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
        ans += '| Δ | Rating |\n';
        ans += '| :---: | :---: ';
        for (let i = 0; i < res.items.length; i++) {
            ans += `| :---: `;
        }
        ans += '| :---: | :---: |\n';
        for (let i = 0; i < res.result.length; i++) {
            ans += `| ${res.result[i].rank} | ${res.result[i].who} `;
            for (let j = 0; j < res.result[i].data.length; j++) {
                if (res.result[i].data[j] instanceof Array) {
                    ans += `| ${res.result[i].data[j][0]}`;
                    for (let k = 1; k < res.result[i].data[j].length; k++) {
                        ans += `<br/><small>${res.result[i].data[j][k]}</small>`
                    }
                    ans += ' ';
                } else {
                    ans += `| ${res.result[i].data[j] || ''} `;
                }
            }
            ans += `| ${int2string(res.result[i].rating.new - res.result[i].rating.old)} | ${res.result[i].rating.old}→${res.result[i].rating.new} |\n`;
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