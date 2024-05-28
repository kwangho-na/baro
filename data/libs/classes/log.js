class func {
	logReader(name, fileName) {
		not(name) name='baro'
		obj=object("logReader.$name")
		if(obj.var(classUse)) {
			return obj;
		}
		path=System.path()
		if( fileName ) {
			logFileName=Cf.val(path,'/',fileName)
		} else {
			date=System.date("yyyyMMdd");
			logFileName=Cf.val(path,"/data/logs/${name}-${date}.log")
		}
		not( isFile(logFileName) ) {
			fileWrite(logFileName, "== $name 로그시작 ==\n");
		}
		class(obj, 'logReader')
		return obj;
	}
	logWriter(name, fileName) {
		not(name) name='baro'
		obj=object("logWriter.$name")
		if(obj.var(classUse)) return obj;
		path=System.path()
		if( fileName ) {
			logFileName=Cf.val(path,'/',fileName)
		} else {
			date=System.date("yyyyMMdd");
			logFileName=Cf.val(path,"/data/logs/${name}-${date}.log")
		}
		not( isFile(logFileName) ) {
			fileWrite(logFileName, "== $name 로그시작 ==\n");
		}
		class(obj, 'logWriter')
	}
}
class logReader {	
	startTime=null
	name=fnParent.get("name");
	logFileName=fnParent.get("logFileName");			
	fileLogReader=Baro.file("logRead_$name"); 
	lastReadCheck=false
	status=0
	logTick=0
	fileCurrentPos=0
	lastRead=false
	this.start()
	start() {
		this.member(startTime, System.localtime())
		this.timeout()
	}
	timeout() {
		not( startTime ) return;
		switch( status ) {
		case 0: 
			if( fileLogReader.open() ) {
				this.member(status, 1);
				return;
			}
			if( fileLogReader.open(logFileName) ) {
				this.member(status,1);
				return true;
			}
			return false;
		case 1:
			not( fileLogReader.open() ) {
				this.member(status,0);
				return;
			}
			size=fileLogReader.size();
			startPos=when( size.gt(1024), size-1024, 0 );
			fileLogReader.seek(startPos);
			this.member(fileCurrentPos, size);
			this.member(status, 2);
			return fileLogReader.read();
		case 2:
			not( fileLogReader.open() ) {
				this.member(status, 0);
				return;
			}
			size=fileLogReader.size();
			if( size.eq(fileCurrentPos) ) return;
			if( size.lt(fileCurrentPos) ) {
				this.member(fileCurrentPos, size);
				return print("파일위치 다시 설정", size, fileCurrentPos);
			}
			fileLogReader.seek(fileCurrentPos);
			this.member(fileCurrentPos, size);
			return fileLogReader.read();
		default:
		}
		return null;
	}
	closeLog() {
		if( fileLogReader.open() ) fileLogReader.close();
		this.member(status, 0);
		this.member(startTime, 0);
	}
}

class logWriter {
	startTime=null 
	name=fnParent.get("name")
	logFileName=fnParent.get("logFileName")
	fileLogAppend=Baro.file("logWriter_$name")
	
	appendLog(data, skip) {
		not( fileLogAppend.open() ) {
			not( fileLogAppend.open(logFileName,'append') ) return print("로그파일 첨부오류 (파일명:$logFileName)");
		}
		if( skip ) return fileLogAppend.append(data);
		fileLogAppend.append("# $data\n");
		fileLogAppend.flush();
	}
	write(data) {
		fileLogAppend.append(data);
		fileLogAppend.flush();
	}
	closeLog() {
		if( fileLogAppend.open() ) fileLogAppend.close();
		this.member(status, 0);
		this.member(startTime, 0);
	}
}