// 3rd party modules
const axios = require('axios');

// custom modules
const { log } = require('./logging.js');

// data
const { debug, githubAuth } = require('../config.json');

var self = module.exports = {
	repoSearch: async function (query) {
        if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Attempting to search using the /repos/(owner)/(repoName) endpoint' }); };
        let response;
        let headers;

        if (!githubAuth) {
            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'No GitHub access token found (githubAuth in config.json), some contribution data might be unavailable!' }); };
            headers = { Accept: 'application/vnd.github.v3+json' };
        } else {
            headers = { Accept: 'application/vnd.github.v3+json', Authorization: `token ${githubAuth}` };
        }
            
        await axios
            .get(`https://api.github.com/repos/${query}`, { headers: headers })
            .then(res => {
            	if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Axios recieved search results from GitHub API.' }); };
                response = res.data;
            })
            .catch(error => {
            	if (error.response) {
            		if (error.response.status == 404) {
                  		if (debug) { log('cmdErr', { event: 'GitHub', content: 'Could not search using the /repos/(owner)/(repoName) endpoint.' }); };
                  		return;
                	} else {
                  		if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
                  		return;
                	}
              	} else {
                	if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
                	return;
              	};
            });

        return response;
    },
    queryRepoSearch: async function (query) {
        if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Attempting to search using the /search/repositories endpoint' }); };
        let response;
        let headers;

        if (!githubAuth) {
        	if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'No GitHub access token found (githubAuth in config.json), some contribution data might be unavailable!' }); };
        	headers = { Accept: 'application/vnd.github.v3+json' };
        } else {
        	headers = { Accept: 'application/vnd.github.v3+json', Authorization: `token ${githubAuth}` };
        }
        
        await axios
        	.get(`https://api.github.com/search/repositories`, { headers: headers, params: { q: encodeURIComponent(query) } })
        	.then(res => {
            	if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Axios recieved search results from GitHub API.' }); };
                if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Using top result.' }); };
                response = res.data.items[0];
              })
              .catch(error => {
              	if (error.response) {
                	if (error.response.status == 422) {
                  		if (debug) { log('cmdErr', { event: 'GitHub', content: `An error occurred! ${error.message}` }); };
                  		return;
                	} else {
                  		if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
                  		return;
                	}
              	} else {
                	if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
                	return;
              	};
            });

        return response;
    },
    contributions: async function (repo) {
		if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Looking up contributions for repository...' }); };
		let response;
		let headers;

		if (!githubAuth) {
			if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'No GitHub access token found (githubAuth in config.json), some contribution data might be unavailable!' }); };
			headers = { Accept: 'application/vnd.github.v3+json' };
		} else {
			headers = { Accept: 'application/vnd.github.v3+json', Authorization: `token ${githubAuth}` };
		}

		await axios
			.get(`https://api.github.com/repos/${repo}/contributors`, { headers: headers, params: { anon: 'true' } })
			.then(res => {
				if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Axios recieved results from GitHub API.' }); };
				response = res.data;
			})
			.catch(error => {
				if (error.response) {
					if (error.response.status == 404) {
						if (debug) { log('cmdErr', { event: 'GitHub', content: 'Something went wrong while looking up contributions for repository! Status code is \"404\"' }); };
						return;
					} else if (error.response.status == 403) {
						if (debug) { log('cmdErr', { event: 'GitHub', content: 'Contributions data is unavailable! Status code is \"403\" (Forbidden)' }); };
						return;
					} else {
						if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
						return;
					}
				} else {
					if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
					return;
				}
			})

		return response;

	},
	userSearch: async function (query) {
        if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Attempting to search using the /users/(username) endpoint' }); };
        let response;
        let headers;

        if (!githubAuth) {
          if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'No GitHub access token found (githubAuth in config.json), some contribution data might be unavailable!' }); };
          headers = { Accept: 'application/vnd.github.v3+json' };
        } else {
          headers = { Accept: 'application/vnd.github.v3+json', Authorization: `token ${githubAuth}` };
        }

        await axios
          .get(`https://api.github.com/users/${query}`, { headers: headers })
          .then(res => {
            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Axios recieved search results from GitHub API.' }); };
            response = res.data;
          })
          .catch(error => {
            if (error.response) {
              if (error.response.status == 404) {
                if (debug) { log('cmdErr', { event: 'GitHub', content: 'Could not search using the /users/(username) endpoint.' }); };
                return;
              }
            } else {
              if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
              return;
            }
          });

        return response;
    },
	queryUserSearch: async function (query) {
        if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Attempting to search using the /search/users endpoint' }); };
        let response;
        let headers;

        if (!githubAuth) {
          if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'No GitHub access token found (githubAuth in config.json), some contribution data might be unavailable!' }); };
          headers = { Accept: 'application/vnd.github.v3+json' };
        } else {
          headers = { Accept: 'application/vnd.github.v3+json', Authorization: `token ${githubAuth}` };
        }

        await axios
          .get(`https://api.github.com/search/users`, { headers: headers, params: { q: encodeURIComponent(query) } })
          .then(res => {
            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Axios recieved search results from GitHub API.' }); };
            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Using top result.' }); };
            response = res.data.items[1];
          })
          .catch(error => {
            if (error.response) {
              if (error.response.status == 422) {
                if (debug) { log('cmdErr', { event: 'GitHub', content: `An error occurred! ${error.message}` }); };
                return;
              } else {
                if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
                return;
              }
            } else {
              if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
              return;
            }
          });

        return response;
    },
	userContributions: async function (user) {
        if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Attempting to get user commits count by using GitHub GraphQL API...' }); };
        let response;
        let headers;

        if (!githubAuth) {
          if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'No GitHub access token found, skipping...' }); };
          return '(Unavailable)';
        } else {
          headers = { headers: { Authorization: `bearer ${githubAuth}` } };
        };

        let data = { query: `query {user(login:"${user}"){contributionsCollection{totalCommitContributions}}}` };
        await axios
          .post('https://api.github.com/graphql', data, headers)
          .then(res => {
            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Axios recieved data from the GitHub GraphQL API.' }); };
            
            try {
            	response = res.data.data.user.contributionsCollection.totalCommitContributions;
            } catch (e) {
            	return '(Unavailable)'
            }
            
          })
          .catch(error => {
              if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
              return;
          })
        
        return response;
    }
}