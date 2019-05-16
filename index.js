#!/usr/bin/env node

"use strict";

const axios = require("axios");
const commandLineArgs = require("command-line-args");
const inquirer = require("inquirer");
const chalk = require("chalk");

const optionDefinitions = [
  { name: "user", alias: "u", type: String },
  { name: "showRepos", alias: "r", type: Boolean }
];

const MAX_WIDTH = 50;

const LABELS = {
  name: "Name:  ",
  github: "GitHub:  ",
  website: "Website:  ",
  company: "Company:  ",
  location: "Location:  ",
  hireable: {
    hireable: "This user is currently available for hire",
    notHireable: "This user is currently not available for hire"
  },
  followers: "# of Followers: ",
  topRepos: "Top 5 Repos:"
};

const options = commandLineArgs(optionDefinitions);

function promptAndGetUserName() {
  if (options.user)
    return Promise.resolve({
      userName: options.user,
      showRepos: options.showRepos
    });

  return inquirer
    .prompt([
      {
        type: "input",
        name: "username",
        message: "Enter a username >"
      }
    ])
    .then(resp => {
      return { userName: resp.username, showRepos: options.showRepos };
    });
}

promptAndGetUserName().then(payload => {
  const { userName, showRepos } = payload;
  axios
    .get(`https://api.github.com/users/${userName}`)
    .then(resp => resp.data)
    .then(userData => {
      if (showRepos) {
        return axios
          .get(`https://api.github.com/users/${userName}/repos`)
          .then(resp => resp.data)
          .then(payload => {
            const res = payload.sort((a, b) => {
              return b.stargazers_count - a.stargazers_count;
            });
            return res;
          })
          .then(repos => {
            return { userData, repos, showRepos };
          });
      } else {
        return { userData, repos: null, showRepos };
      }
    })
    .then(data => {
      const { userData, repos, showRepos } = data;
      const lines = [];
      const {
        name,
        html_url,
        company,
        login,
        location,
        hireable,
        blog,
        followers
      } = userData;
      // NAME
      const gitHubName = name || login || "-";
      lines.push(
        chalk.cyan.bold(LABELS.name) +
          gitHubName.padStart(MAX_WIDTH - LABELS.name.length)
      );

      // PROFILE
      const githubUrl = html_url || "-";
      lines.push(
        chalk.cyan.bold(LABELS.github) +
          githubUrl.padStart(MAX_WIDTH - LABELS.github.length)
      );

      // PERSONAL WEBSITE
      const blogUrl = blog || "-";
      lines.push(
        chalk.cyan.bold(LABELS.website) +
          blogUrl.padStart(MAX_WIDTH - LABELS.website.length)
      );

      // COMPANY
      const companyName = company || "-";
      lines.push(
        chalk.cyan.bold(LABELS.company) +
          companyName.padStart(MAX_WIDTH - LABELS.company.length)
      );

      // LOCATION
      const githubLocation = location || "-";
      lines.push(
        chalk.cyan.bold(LABELS.location) +
          githubLocation.padStart(MAX_WIDTH - LABELS.location.length)
      );

      // FOLLOWERS
      const ghFollowers = followers || "-";
      lines.push(" ".repeat(MAX_WIDTH));
      lines.push(
        chalk.cyan.bold(LABELS.followers) +
          ghFollowers.toString().padStart(MAX_WIDTH - LABELS.followers.length)
      );

      // HIRE STATUS
      const hireMessage = hireable
        ? chalk.green.bold(LABELS.hireable.hireable.padEnd(MAX_WIDTH))
        : chalk.red.bold(LABELS.hireable.notHireable.padEnd(MAX_WIDTH));
      lines.push(" ".repeat(MAX_WIDTH));
      lines.push(hireMessage);

      console.log(" ".repeat(5) + "-".repeat(MAX_WIDTH + 2));
      lines.forEach(line => console.log(" ".repeat(4) + `| ${line} |`));
      console.log(" ".repeat(5) + "-".repeat(MAX_WIDTH + 2));
      lines.push(" ".repeat(MAX_WIDTH));
      lines.push(" ".repeat(MAX_WIDTH));
      if (showRepos) {
        console.log(
          " ".repeat(4) +
            `| ${chalk.cyan.bold(LABELS.topRepos.padEnd(MAX_WIDTH))} |`
        );
        lines.push(" ".repeat(MAX_WIDTH));
        repos.slice(0, 5).forEach(repo => {
          const label = `${repo.name} - ${repo.stargazers_count} ⭐  `;
          console.log(
            " ".repeat(4) +
              `| ${chalk.gray.bold(`${label}`) +
                repo.html_url.padStart(MAX_WIDTH - label.length)} |`
          );
        });
      }
    })
    .catch(err => {
      console.error(err);
      console.error(`Something went wrong loading ${username}, do they exist?`);
    });
});
