#!/usr/bin/env node

"use strict";

const axios = require("axios");
const commandLineArgs = require("command-line-args");
const inquirer = require("inquirer");

const optionDefinitions = [{ name: "user", alias: "u", type: String }];

const MAX_MIDDLE = 80;

const LABELS = {
  name: " Name:",
  github_profile: " GitHub Profile:",
  company: " Company:"
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
      const { name, html_url, company, login } = data;

      const MAX_WHITESPACE = MAX_MIDDLE - 2;

      let gitHubName = name || login;

      const nameWithLabel = `${LABELS.name}${" ".repeat(
        MAX_WHITESPACE -
          LABELS.name.length -
          (gitHubName ? gitHubName.length : 0)
      )}${gitHubName}  `;

      const githubProfile = `${LABELS.github_profile}${" ".repeat(
        MAX_WHITESPACE -
          LABELS.github_profile.length -
          (html_url ? html_url.length : 0)
      )}${html_url}  `;

      const companyProfile = `${LABELS.company}${" ".repeat(
        MAX_WHITESPACE - LABELS.company.length - (company ? company.length : 0)
      )}${company || ""}  `;

      // Print Card
      console.log(" ".repeat(5) + "-".repeat(MAX_MIDDLE));
      gitHubName && console.log(" ".repeat(4) + "|" + nameWithLabel + "|");
      githubProfile && console.log(" ".repeat(4) + "|" + githubProfile + "|");
      companyProfile && console.log(" ".repeat(4) + "|" + companyProfile + "|");
      console.log(" ".repeat(5) + "-".repeat(MAX_MIDDLE));
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
});
