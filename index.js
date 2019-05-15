#!/usr/bin/env node

"use strict";

const axios = require("axios");
const commandLineArgs = require("command-line-args");
const inquirer = require("inquirer");
const chalk = require("chalk");

const optionDefinitions = [{ name: "user", alias: "u", type: String }];

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
  }
};

const options = commandLineArgs(optionDefinitions);

function promptAndGetUserName() {
  if (options.user) return Promise.resolve(options.user);

  return inquirer
    .prompt([
      {
        type: "input",
        name: "username",
        message: "Enter a username >"
      }
    ])
    .then(resp => resp.username);
}

promptAndGetUserName().then(username => {
  axios
    .get(`https://api.github.com/users/${username}`)
    .then(resp => resp.data)
    .then(data => {
      const lines = [];
      const { name, html_url, company, login, location, hireable, blog } = data;

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

      // HIRE STATUS
      const hireMessage = hireable
        ? chalk.green.bold(LABELS.hireable.hireable.padEnd(MAX_WIDTH))
        : chalk.red.bold(LABELS.hireable.notHireable.padEnd(MAX_WIDTH));
      lines.push(" ".repeat(MAX_WIDTH));
      lines.push(hireMessage);

      console.log(" ".repeat(5) + "-".repeat(MAX_WIDTH + 2));
      lines.forEach(line => console.log(" ".repeat(4) + `| ${line} |`));
      console.log(" ".repeat(5) + "-".repeat(MAX_WIDTH + 2));
    })
    .catch(() => {
      console.error(`Something went wrong loading ${username}, do they exist?`);
    });
});
