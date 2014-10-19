var restify = require('restify');
var MongoClient = require('mongodb').MongoClient;

// store info to mongo

var url = 'mongodb://hd14:hd14@ds033380.mongolab.com:33380/hd14';
var db;

function storeInMongo(gitInfo) {
  var githubEvents = db.collection('GitHub-Events');
  // Insert some documents
  githubEvents.insert(gitInfo, function(err, result) {
    if (err) {
      console.log("writing github-info failed: "+err);
    } else {
      console.log("wrote github-info, id: "+result["_id"]);
    }
  });
}
// dump info to console

function dumpGitInfo(gitInfo) {
  var repo = gitInfo.repository.name;
  console.log("activity in repo '"+repo+"'");

  for (var i = 0; i < gitInfo.commits.length; i++) {
    console.log("commit by: "+gitInfo.commits[i].author.name);
    console.log("--> msg: "+gitInfo.commits[i].message);
    console.log("--> id : "+gitInfo.commits[i].id);
  }

  storeInMongo(gitInfo);
}

// config rest-server

var server = restify.createServer();
server.use(restify.bodyParser({rejectUnknown:true}));

server.post('/github/hd14', function (req, res, next) {
  dumpGitInfo(req.body);
  res.send(200, "ok");
  return next();
});

server.get('/testdata', function (req, res, next) {
  res.send({temp : "99,9", light: "120"});
  return next();
});


// start server, connect to mongo

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
  MongoClient.connect(url, function(err, dbconnect) {
  	if (err) {
  	  throw new Error(err);
  	} else {
  	  console.log("connected correctly to MongoDB-server");
  	  db = dbconnect;
  	}
  });
});

/*
{
    "ref": "refs/heads/master",
    "before": "161627eb91839bae2385e9c5cf17791f6a93c267",
    "after": "3fb6b0a29ce8baa86589abfb00c03d92538f2c19",
    "created": false,
    "deleted": false,
    "forced": false,
    "base_ref": null,
    "compare": "https://github.com/senacor/Hacking-Days-2014/compare/161627eb9183...3fb6b0a29ce8",
    "commits": [
        {
            "id": "3fb6b0a29ce8baa86589abfb00c03d92538f2c19",
            "distinct": true,
            "message": "update",
            "timestamp": "2014-10-14T21:57:59+02:00",
            "url": "https://github.com/senacor/Hacking-Days-2014/commit/3fb6b0a29ce8baa86589abfb00c03d92538f2c19",
            "author": {
                "name": "Ralph Winzinger",
                "email": "ralph.winzinger@senacor.com",
                "username": "rwinzinger"
            },
            "committer": {
                "name": "Ralph Winzinger",
                "email": "ralph.winzinger@senacor.com",
                "username": "rwinzinger"
            },
            "added": [
                "touch.file"
            ],
            "removed": [],
            "modified": []
        }
    ],
    "head_commit": {
        "id": "3fb6b0a29ce8baa86589abfb00c03d92538f2c19",
        "distinct": true,
        "message": "update",
        "timestamp": "2014-10-14T21:57:59+02:00",
        "url": "https://github.com/senacor/Hacking-Days-2014/commit/3fb6b0a29ce8baa86589abfb00c03d92538f2c19",
        "author": {
            "name": "Ralph Winzinger",
            "email": "ralph.winzinger@senacor.com",
            "username": "rwinzinger"
        },
        "committer": {
            "name": "Ralph Winzinger",
            "email": "ralph.winzinger@senacor.com",
            "username": "rwinzinger"
        },
        "added": [
            "touch.file"
        ],
        "removed": [],
        "modified": []
    },
    "repository": {
        "id": 24564449,
        "name": "Hacking-Days-2014",
        "full_name": "senacor/Hacking-Days-2014",
        "owner": {
            "name": "senacor",
            "email": null
        },
        "private": false,
        "html_url": "https://github.com/senacor/Hacking-Days-2014",
        "description": "Senacor Hacking Days 2014",
        "fork": false,
        "url": "https://github.com/senacor/Hacking-Days-2014",
        "forks_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/forks",
        "keys_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/teams",
        "hooks_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/hooks",
        "issue_events_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/issues/events{/number}",
        "events_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/events",
        "assignees_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/assignees{/user}",
        "branches_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/branches{/branch}",
        "tags_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/tags",
        "blobs_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/languages",
        "stargazers_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/stargazers",
        "contributors_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/contributors",
        "subscribers_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/subscribers",
        "subscription_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/subscription",
        "commits_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/issues/comments/{number}",
        "contents_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/contents/{+path}",
        "compare_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/merges",
        "archive_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/downloads",
        "issues_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/issues{/number}",
        "pulls_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/labels{/name}",
        "releases_url": "https://api.github.com/repos/senacor/Hacking-Days-2014/releases{/id}",
        "created_at": 1411922541,
        "updated_at": "2014-10-14T19:55:09Z",
        "pushed_at": 1413316707,
        "git_url": "git://github.com/senacor/Hacking-Days-2014.git",
        "ssh_url": "git@github.com:senacor/Hacking-Days-2014.git",
        "clone_url": "https://github.com/senacor/Hacking-Days-2014.git",
        "svn_url": "https://github.com/senacor/Hacking-Days-2014",
        "homepage": null,
        "size": 1680,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "JavaScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "has_pages": true,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 0,
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "master",
        "stargazers": 0,
        "master_branch": "master",
        "organization": "senacor"
    },
    "pusher": {
        "name": "rwinzinger",
        "email": "ralph.winzinger@senacor.com"
    },
    "organization": {
        "login": "senacor",
        "id": 1535912,
        "url": "https://api.github.com/orgs/senacor",
        "repos_url": "https://api.github.com/orgs/senacor/repos",
        "events_url": "https://api.github.com/orgs/senacor/events",
        "members_url": "https://api.github.com/orgs/senacor/members{/member}",
        "public_members_url": "https://api.github.com/orgs/senacor/public_members{/member}",
        "avatar_url": "https://avatars.githubusercontent.com/u/1535912?v=2"
    },
    "sender": {
        "login": "rwinzinger",
        "id": 299279,
        "avatar_url": "https://avatars.githubusercontent.com/u/299279?v=2",
        "gravatar_id": "",
        "url": "https://api.github.com/users/rwinzinger",
        "html_url": "https://github.com/rwinzinger",
        "followers_url": "https://api.github.com/users/rwinzinger/followers",
        "following_url": "https://api.github.com/users/rwinzinger/following{/other_user}",
        "gists_url": "https://api.github.com/users/rwinzinger/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/rwinzinger/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/rwinzinger/subscriptions",
        "organizations_url": "https://api.github.com/users/rwinzinger/orgs",
        "repos_url": "https://api.github.com/users/rwinzinger/repos",
        "events_url": "https://api.github.com/users/rwinzinger/events{/privacy}",
        "received_events_url": "https://api.github.com/users/rwinzinger/received_events",
        "type": "User",
        "site_admin": false
    }
}
*/