#!/usr/bin/env node

"use strict";

const axios = require('axios')

const MAX_MIDDLE = 80

const LABELS = {
    name: ' Name:',
    github_profile: ' GitHub Profile:'
}
console.log(process.argv)

axios.get('https://api.github.com/users/lorderikir')
    .then(resp => resp.data)
    .then(data => {
        const { name, html_url } = data

        const MAX_WHITESPACE = MAX_MIDDLE - 2
        
        const nameWithLabel = `${LABELS.name}${' '.repeat(MAX_WHITESPACE-LABELS.name.length-name.length)}${name}  `
        const githubProfile = `${LABELS.github_profile}${' '.repeat(MAX_WHITESPACE-LABELS.github_profile.length-html_url.length)}${html_url}  `
        console.log(' '.repeat(5) + '-'.repeat(MAX_MIDDLE))
        name && console.log(' '.repeat(4) + '|' + nameWithLabel + '|')
        githubProfile && console.log(' '.repeat(4) + '|' + githubProfile + '|')
        console.log(' '.repeat(5) + '-'.repeat(MAX_MIDDLE))

    })