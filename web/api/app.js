<func note="앱웹 공통함수 모음">
	@app.clipboardChange(type,&data,&str) {
		use=conf("prop.clipboardUse")
		if( use.eq('N') ) return;
		switch(type) {
		case image:
			ss=data.value(0,10)
			tm=System.localtime()
			fullPath="data/clipboard_captures/${tm}.png";
			if(ss.find("PNG")) {
				logWriter('app').appendLog("##> clipboard [image] copyed::$fullPath\r\n")
				fileWrite(fullPath, data)
			}
		case text:
			if(data.start('file:///')) {
				logWriter('app').appendLog("##> clipboard [file] copyed::$data\r\n")
			} else {
				logWriter('app').appendLog("##> clipboard [text] copyed::$data\r\n")
			}
		case html:
			htmlUse=conf("prop.clipboardHtmlUse")
			if( str && htmlUse.eq('N') ) {
				logWriter('app').appendLog("##> clipboard [text] copyed::$str\r\n")
			} else {
				logWriter('app').appendLog("##> clipboard [html] copyed::$data\r\n")
			}
		default:
			print("clipboard copy type error", data)
		}
	}
	
</func>


<func note="깃요청 처리">
	@git.proc(type, data) {
		if(type=='read') {
			this.appendText('result', data)
		}
		if(type=='finish') {
			print("git call finished")
		}
	}
	@git.call(url, method, data) {
		w=Baro.web('git')
		w.data=data
		w.result=''
		h=w.addNode('@header').reuse()
		h.set('Accept', 'application/vnd.github+json')
		h.set('X-GitHub-Api-Version', '2022-11-28')
		h.set('Authorization', 'Bearer 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')
		logWriter('git').appendLog("@@GIT URL CallStart $url")
		w.call(url,method, @git.proc)
		logWriter('git').appendLog(w.result)
		return w.result		
	} 
	@git.addFile(path, gitPath, commitMessage) {
		node=object('git.tree')
		fo=Baro.file()
		fileData=fo.readBase64(path)
		not(fileData) return print("$path 경로 파일 읽기오류");
		data=
#[{
	"content": "${fileData}",
	"encoding": "base64"
}]
		ss=@git.call('https://api.github.com/repos/kwangho-na/baro/git/blobs','post',data)
		blobs=node.addNode('blobs').parseJson(ss)
		blobs.path=gitPath

		ss=@git.call('https://api.github.com/repos/kwangho-na/baro/git/trees/na')
		node.parseJson(ss)
		/*
		ss=@git.call('https://api.github.com/repos/kwangho-na/baro/git/refs/heads/na')
		refs=node.addNode('refs').parseJson(ss)
		*/
		data=
#[{
	"base_tree": "${node.sha}",
	"tree": [{
		"path": "${blobs.path}",
		"mode": "100644",
		"type": "blob",
		"sha": "${blobs.sha}"
	}]
}]
		ss=@git.call('https://api.github.com/repos/kwangho-na/baro/git/trees','post',data)
		currentTree=node.addNode("currentTree").parseJson(ss)
		data=
#[{
	"message": "${commitMessage}",
	"tree": "${currentTree.sha}",
	"parents": ["${node.sha}"]
}]
		ss=@git.call('https://api.github.com/repos/kwangho-na/baro/git/commits', 'post', data)
		commits=node.addNode('commits')
		commits.parseJson(ss)
		data=#[{
			"sha": "${commits.sha}",
			"force": false
		}]
		ss=@git.call('https://api.github.com/repos/kwangho-na/baro/git/refs/heads/na', 'patch', data)
		sub=node.addNode('updatePatch')
		sub.parseJson(ss)
		return sub;
	}
</func>