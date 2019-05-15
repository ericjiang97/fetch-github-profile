#!/usr/bin/env node

"use strict";

const axios = require("axios");
const commandLineArgs = require("command-line-args");
const inquirer = require("inquirer");
const chalk = require("chalk");

const optionDefinitions = [{ name: "user", alias: "u", type: String }];

const MAX_MIDDLE = 80;

const LABELS = {
  name: " Name:",
  github_profile: " GitHub Profile:",
  company: " Company:",
  location: " Location:",
  hireable: {
    hireable: " This user is currently available for hire",
    notHireable: " This user is currently not available for hire"
  }
};
const options = commandLineArgs(optionDefinitions);

function promptAndGetUserName() {
  if (options.user === null || options.user === undefined) {
    return inquirer
      .prompt([
        {
          type: "input",
          name: "username",
          message: "enter a username"
        }
      ])
      .then(resp => {
        return resp.username;
      });
  } else {
    return new Promise((resolve, reject) => resolve(options.user));
  }
}
promptAndGetUserName().then(username => {
  axios
    .get(`https://api.github.com/users/${username}`)
    .then(resp => resp.data)
    .then(data => {
      const { name, html_url, company, login, location, hireable } = data;

      const MAX_WHITESPACE = MAX_MIDDLE - 2;

      let gitHubName = name || login;
      const gitHubHireable = hireable
        ? chalk.green.bold(LABELS.hireable.hireable)
        : chalk.red.bold(LABELS.hireable.notHireable);
      const gitHubHireableLength = hireable
        ? LABELS.hireable.hireable.length
        : LABELS.hireable.notHireable.length;

      const nameWithLabel = `${chalk.cyan.bold(LABELS.name)}${" ".repeat(
        MAX_WHITESPACE -
          LABELS.name.length -
          (gitHubName ? gitHubName.length : 0)
      )}${gitHubName}  `;

      const githubProfile = `${chalk.cyan.bold(
        LABELS.github_profile
      )}${" ".repeat(
        MAX_WHITESPACE -
          LABELS.github_profile.length -
          (html_url ? html_url.length : 0)
      )}${html_url}  `;

      const companyProfile = `${chalk.cyan.bold(LABELS.company)}${" ".repeat(
        MAX_WHITESPACE - LABELS.company.length - (company ? company.length : 0)
      )}${company || ""}  `;

      const gitHubLocation = `${chalk.cyan.bold(LABELS.location)}${" ".repeat(
        MAX_WHITESPACE -
          LABELS.location.length -
          (location ? location.length : 0)
      )}${location || ""}  `;

      const cardInfoGitHubHireable = `${gitHubHireable}${" ".repeat(
        MAX_WHITESPACE - gitHubHireableLength + 1
      )} `;

      // Print Card
      console.log(" ".repeat(5) + "-".repeat(MAX_MIDDLE));
      gitHubName && console.log(" ".repeat(4) + "|" + nameWithLabel + "|");
      githubProfile && console.log(" ".repeat(4) + "|" + githubProfile + "|");
      companyProfile && console.log(" ".repeat(4) + "|" + companyProfile + "|");
      gitHubLocation && console.log(" ".repeat(4) + "|" + gitHubLocation + "|");
      cardInfoGitHubHireable &&
        console.log(" ".repeat(4) + "|" + cardInfoGitHubHireable + "|");
      console.log(" ".repeat(5) + "-".repeat(MAX_MIDDLE));
    })
    .catch(error => {
      console.error(
        "unable to complete your transaction, maybe the user doesn't exist?"
      );
      process.exit(1);
    });
});
