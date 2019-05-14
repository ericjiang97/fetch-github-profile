#!/usr/bin/env node

"use strict";

const axios = require('axios')
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
    { name: 'user', alias: 'u', type: String },
  ]

const MAX_MIDDLE = 80

const LABELS = {
    name: ' Name:',
    github_profile: ' GitHub Profile:',
    company: ' Company:'
}
const options = commandLineArgs(optionDefinitions)

if(options.user === null || options.user === undefined){
    console.error('An occured has occured, please pass in a user under --user="username"')
    process.exit(1);
}

axios.get(`https://api.github.com/users/${options.user}`)
    .then(resp => resp.data)
    .then(data => {
        const { name, html_url, company } = data

        const MAX_WHITESPACE = MAX_MIDDLE - 2
        
        const nameWithLabel = `${LABELS.name}${' '.repeat(MAX_WHITESPACE-LABELS.name.length-name.length)}${name}  `
        const githubProfile = `${LABELS.github_profile}${' '.repeat(MAX_WHITESPACE-LABELS.github_profile.length-html_url.length)}${html_url}  `
        const companyProfile = `${LABELS.company}${' '.repeat(MAX_WHITESPACE-LABELS.company.length-(company ? company.length : 0))}${company || ''}  `
        console.log(' '.repeat(5) + '-'.repeat(MAX_MIDDLE))
        name && console.log(' '.repeat(4) + '|' + nameWithLabel + '|')
        githubProfile && console.log(' '.repeat(4) + '|' + githubProfile + '|')
        companyProfile && console.log(' '.repeat(4) + '|' + companyProfile + '|')
        console.log(' '.repeat(5) + '-'.repeat(MAX_MIDDLE))

    })