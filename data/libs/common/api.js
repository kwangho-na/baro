<func note="web api 함수">
apiController(req, param, service, uri) {
	bound=req.getValue('boundary');
	buffer=null;
	if(bound) {
		@api.parseReqParam( req, param, bound );
	} else {
		buffer=req.readBuffer();
		if(buffer) {
			type=req.getValue('Content-Type');
			if(type.eq('application/xml')) {
				parseXml(buffer);
			} else {
				param.parseJson(buffer);
			}
		}
	}
	param.var(uri, uri);
	/*
	print("api start [$service]");
	setHttpHeader(req, #[
		Access-Control-Allow-Origin: http://localhost:8080
		Access-Control-Allow-Credentials: true
		Access-Control-Max-Age: 86400
		Access-Control-Allow-Headers: Accept, Content-Type, X-PINGOTHER
		Access-Control-Allow-Method: GET, POST, PUT, OPTIONS
	]);
	*/
	Cf.error(true);
	/*
	subPageCode=uri.findPos('/@').trim()
	print("API start => ", service, subPageCode)
	src=conf("src#${service}.${subPageCode}")
	if(src) {
		return req.send(@pages.subPageSource(src,param))
	} 
	*/	
	result=@api.service(service, uri, param, buffer);
	not(result) result=param;
	err=Cf.error();
	if(err) {
		if(typeof(result,'node')) result.error=err;
	}
	if( typeof(result,'node')) {
		if(result.var(checkSend)) return;
		req.send(@json.listData(result) );
	} else {
		req.send(result);
	} 
}
@api.addServiceFunc(serviceNode, &s) {
	ss='', src='', idx=0
	while(s.valid() ) {
		left=s.findPos('<api')
		ss.add(left)
		not(s.ch()) break;
		a=s.findPos('</api>')
		a.findPos('>');
		src.add(a)
		idx++;
	}
	if(src) serviceNode[$src]
	Cf.sourceApply(ss)
}

@api.service(service, &uri, param, buffer) {
	if( service=='page' ) {
		path=webRoot()
		pageSrc=fileRead("$path/template/page.tpl.html");
		if( pageSrc ) {
			app=object('api.app')
			param.all=true
			param.title=uri
			param.data=app.components(req, param, uri)
			return format(pageSrc, param)
		}
	}
	fo=Baro.file('api');
	vars=null;
	objectId=service;
	if(uri.find('/') ) {
		name=uri.findPos('/').trim();
		fileName="web/api/${service}.${name}.js";
		if(fo.isFile(fileName)) {
			objectId="${service}.${name}";
			name=uri.findPos('/').trim();
		} else {
			fileName="web/api/${service}.js";
		}
		vars=uri.trim();
	} else {
		name=uri.trim();
		fileName="web/api/${service}.js";
	}
	serviceNode=Cf.getObject("api", objectId, true);	
	modifyTm=fo.modifyDate(fileName);
	not(modifyTm.eq(serviceNode.lastModifyTm)) { 
		@api.addServiceFunc(serviceNode, fileRead(fileName));
		serviceNode.lastModifyTm=modifyTm;
	}
	fc=serviceNode[$name];
	if(typeof(fc,'func')) {
		return fc(req, param, vars, buffer)
	} else {
		param.error="$fileName 파일에 $name 함수미정의")
	}
	return param;
}
@api.addFunc(&uri, src, param, skipSave) {
	fo=Baro.file('api');
	vars=null;
	if(uri.start('/api/',true)) print("api addFunc URI=$uri");
	if(uri.ch('/')) uri.incr();
	service=uri.findPos('/').trim();
	objectId=service;
	if(uri.find('/') ) {
		name=uri.findPos('/').trim();
		fileName="web/api/${service}.${name}.js";
		if(fo.isFile(fileName)) {
			objectId="${service}.${name}";
			name=uri.findPos('/').trim();
		} else {
			fileName="web/api/${service}.js";
		}
		vars=uri.trim();
	} else {
		name=uri.trim();
		fileName="web/api/${service}.js";
	}
	print(">>API 함수 추가 ($name, $fileName)");
	serviceNode=Cf.getObject("api", objectId, true);
	src=src.trim();
	srcFunc="${name}(req, param, &vars) {\n\t${src}\n}\n";
	serviceNode[$src];
	param.result="ok";
	if(skipSave) return;
	srcSave=parse(name, fileRead(fileName));
	if(srcSave) fileSave(fileName, srcSave);
	parse=func(name,&s) {
		ss='';
		bfind=false;
		while(s.valid()) {
			left=s.findPos(name);
			ss.add(left);
			not(s.valid()) break;
			if(isFuncCheck(s)) {
				s.match();
				s.match(1);
				ss.add("\n", srcFunc);
				ss.add(s);
				bfind=true;
				break;
			}
		}
		not(bfind) ss.add("\n", srcFunc);
		return ss;
	};
	isFuncCheck=func(&s) {
		not(s.ch('(')) return false;
		s.match()
		not(s.ch('{')) return false;
		src=s.match(1);
		if(typeof(src,'bool')) return false;
		return true;
	};
}
@api.call(&uri, param) {
	if(uri.start('/api/', true) ) {
	
	} else if(uri.ch('/')) {
		uri.incr();
	}
	ss=uri
	service=uri.findPos('/').trim();
	name=null, vars=null;
	if(uri.find('/') ) {
		name=uri.findPos('/').trim();
		fileName="web/api/${service}.${name}.js";
		if(isFile(fileName)) {
			name=uri.findPos('/').trim();
		} else {
			fileName="web/api/${service}.js";
		}
		vars=uri.trim();
	} else {
		name=uri.trim();
		fileName="web/api/${service}.js";
	}
	print(">>", name, vars, fileName)
	serviceObject=object("api.${service}");	
	not(serviceObject) return print("$service $name 서비스가 없습니다 (경로: $ss)")
	fc=serviceObject.get(name);
	not(typeof(fc,'function')) return print("$service $name 함수가 없습니다 (경로: $ss)", serviceObject)
	return fc(serviceObject, param, vars, data);
}
@api.parseReqParam( req, param, bound ) {
	buf=req.readBuffer();
	contentLength=req.getValue("Content-Length");
	not(bound) bound=req.getValue('boundary');
	boundCheck=Cf.val('--',bound);
	print(">> multipartParse boundCheck: $boundCheck", contentLength, buf.size() );
	buf.findPos(boundCheck);
	while( buf.valid(), n, 0 ) {
		left=buf.findPos(boundCheck);
		header=left.findPos("\r\n\r\n");
		not(header.ch()) break; 
		node=@api.multipartHeader(header);
		node.inject(name, filename);
		not( name ) continue;
		contentType=node.get("Content-Type");
		print("@api.parseReqParam node=>$node");
		if(filename) {
			param[$name]=filename;
			data=left.findLast("\r\n");
			uploadPath=Cf.val(System.path(), "/data/temp/$filename");
			print(">> upload $name=$filename PATH:$uploadPath", contentType, data.size() );
			writeFile(uploadPath, data);
			param.var(uploadFilePath, uploadPath);
		} else {
			param[$name]=left.trim();
		} 
	}
	return param;
}

@api.multipartHeader(&s) {
	node=_node();
	while( s.valid(), n, 0 ) {
		not( s.ch() ) break;
		line=s.findPos("\n");
		type=line.findPos(":").trim();
		not( type ) break;
		kind=line.findPos(";").trim();
		node.set(type, kind );
		not( line.ch() ) continue;
		while( line.valid() ) {
			key=line.findPos("=").trim();
			c=line.ch();
			if( c.eq() ) {
				val=line.match();
			} else {
				val=line.findPos(";").trim();
			}
			node.set(key, val);
			if( line.ch(';') ) line.incr();
		}
	}
	return node;
}
@api.uploadSave(data) {
	use(param) not(param) return print("upload save error : param not define");
	param.inject(fnm, fkey, uploadPath);
	num=lpad(param.fidx), size=data.size();
	not( uploadPath ) {
		uploadPath="data/upload";
	}
	path=wasRoot();
	fileName=Cf.val(path,'/',uploadPath,'/', fkey,'#',num,'-',fnm);
	Baro.file("upload").writeAll(fileName, data );
	print(">> upload idx:$num  size:$size", fileName);
}
@api.uploadFileCopy(uploadKey, savePath, fileName) {
	fo=Baro.file('upload');
	not(fo.isFolder(savePath)) fo.mkdir(savePath, true);
	destFullName="$savePath/$fileName";
	if(fo.isFile(destFullName)) fo.delete(destFullName);
	foDest=Baro.file("dest");
	not(foDest.open(destFullName, "append")) return print("업로드 파일복사 오류 키:$uploadKey 파일명:$destFullName");
	uploadPath=Cf.val(System.path(), "/data/temp/$filename");
	fo.var(sort,'type,name')
	fo.var(nameFilter, "${uploadKey}-*.*");
	fo.list(uploadPath, func(info) {
		while(info.next()) {
			info.inject(type, name, fullPath);
			foDest.append( fullPath, true );
		}
	})
	foDest.close();	
}

</func>