xui.define("xui/git", function(require, exports, module) {	
	const githubAccessToken='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'
	const branchName='na-test'
	
	const createGithubFileBlob = async (content, encoding) => {
		const blobResp = await fetch(`https://api.github.com/repos/kwangho-na/baro/git/blobs`,
		{
			method: 'POST',
			headers: {
				'Accept': 'application/vnd.github+json',
				'Authorization': `Bearer ${githubAccessToken}`,
				'X-GitHub-Api-Version': '2022-11-28'
			},
			body: JSON.stringify({content,encoding})
		})
		const response = await blobResp.json();
		return response.sha
	}

	const getShaForBaseTree = async () => {
		const baseTreeResp = await fetch(`https://api.github.com/repos/kwangho-na/baro/git/trees/${branchName}`,
			{
				method: 'GET',
				headers: {
					'Accept': 'application/vnd.github+json',
					'Authorization': `Bearer ${githubAccessToken}`,
					'X-GitHub-Api-Version': '2022-11-28'
				},
			})
		const response = await baseTreeResp.json()

		return response.sha
	}

	const getParentSha = async () => {
		const parentResp = await fetch(`https://api.github.com/repos/kwangho-na/baro/git/refs/heads/${branchName}`,
			{
				method: 'GET',
				headers: {
					'Accept': 'application/vnd.github+json',
					'Authorization': `Bearer ${githubAccessToken}`,
					'X-GitHub-Api-Version': '2022-11-28'
				},
			})
		const response = await parentResp.json()

		return response.object.sha
	}

	const createGithubRepoTree = async (articleFiles) => {
		const shaForBaseTree = await getShaForBaseTree()

		const tree = []

		for (var i = 0; i < articleFiles.length; i++) {
			const fileSha = await createGithubFileBlob(articleFiles[i].content, articleFiles[i].encoding)
			tree.push({
				"path": articleFiles[i].path,
				"mode": "100644",
				"type": "blob",
				"sha": fileSha
			})
		}

		const payload = {"base_tree": shaForBaseTree, "tree": tree }

		const treeResp = await fetch(`https://api.github.com/repos/kwangho-na/baro/git/trees`,
			{
				method: 'POST',
				headers: {
					'Accept': 'application/vnd.github+json',
					'Authorization': `Bearer ${githubAccessToken}`,
					'X-GitHub-Api-Version': '2022-11-28'
				},
				body: JSON.stringify(payload)
			})
		const response = await treeResp.json()

		return response.sha
	}

	const createCommit = async (commitMessage, articleFiles) => {
		const tree = await createGithubRepoTree(articleFiles)
		const parentSha = await getParentSha()
		const payload = {
			"message": commitMessage,
			"tree": tree,
			"parents": [parentSha]
		}

		const response = await fetch(`https://api.github.com/repos/kwangho-na/baro/git/commits`,
			{
				method: 'POST',
				headers: {
					'Accept': 'application/vnd.github+json',
					'Authorization': `Bearer ${githubAccessToken}`,
					'X-GitHub-Api-Version': '2022-11-28'
				},
				body: JSON.stringify(payload)
			})

		const commitResp = await response.json()
		const commitSha = commitResp.sha
		await updateGithubBranchRef(commitSha)
	}

	const updateGithubBranchRef = async (commitSha) => {
		const payload = {"sha":commitSha, "force": false}
		const response = await fetch(`https://api.github.com/repos/kwangho-na/baro/git/refs/heads/${branchName}`,
			{
				method: 'PATCH',
				headers: {
					'Accept': 'application/vnd.github+json',
					'Authorization': `Bearer ${githubAccessToken}`,
					'X-GitHub-Api-Version': '2022-11-28'
				},
				body: JSON.stringify(payload)
			})

		const commitResp = await response.json()
		clog("commitResp =>", commitResp);
	}
	/*
	const articleFiles = [
		  {
			path: "/my-new-website/index.html",
			content: "Hello World!",
			encoding: "utf-8",
		  },
		  {
			path: "/my-new-website/images/logo.png",
			content: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQ",
			encoding: "base64",
		  },
	]
	await createCommit(articleFiles);
	*/
	
	exports.createCommit=createCommit;
});