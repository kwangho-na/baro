<func comment="json 유틸리티 함수">
@json.listData(node, fields, listCode, skip) {
	/*
		checkField => 첫번째 자식노드 필드정보 : 자식노드 각각 필드정보
		skip => 노드 프로퍼티 무식 (리스트만 생성)
	*/
	rst='';
	not( listCode ) listCode='children';
	print("xx json list data xx", listCode, node.get(listCode))
	if( listCode=='none') {
		listCode=''
	} else if(node.get(listCode)) {
		listCode=''
	}
	fa=null, checkField=true;
	not(fields) fields=node.var(fields);
	if( fields ) {
		if( typeof(fields,'bool') ) {
			checkField=false;
		} else if( typeof(fields,'array') ) {
			fa=fields;
		} else {
			fa=fields.split(',');
		}
	} else {
		checkField=node.var(checkField);
	}
	if( skip ) {
		rst.add("[");
	} else {
		num=0;
		rst.add("{");
		if(node.var(propMode)) {
			checkField=false;
			while( key, node.keys() ) {
				if( key.ch('@') ) continue;
				val=node.get(key);
				if(typeof(val,'func','node','array')) continue;
				rst.add(Cf.jsValue(key), ':', Cf.jsValue(val) );
				num++;
			}
		} else {
			while( key, node.keys() ) {
				if( key.ch('@') ) continue;
				val=node.get(key);
				if(typeof(val,'null','func')) continue;
				if( num ) rst.add(',');
				if(typeof(val,'node')) {
					rst.add(Cf.jsValue(key), ':', @json.nodeStr(val) );
				} else if(typeof(val,'array')) {
					rst.add(Cf.jsValue(key), ':', @json.arrayStr(val) );
				} else {
					rst.add(Cf.jsValue(key), ':', Cf.jsValue(val) );
				}
				num++;
			}
			if( typeof(fa,'array') ) {
				if( num ) rst.add(',');
				rst.add('"fields":[')
				while( key, fa, idx, 0 ) {
					if( idx ) rst.add(',');
					rst.add( Cf.jsValue(key) );
				}
				rst.add("]");
				num++;
			}
		}
		not( listCode ) {
			rst.add('}')
			return rst;
		} 
		if(num) rst.add(',');
		rst.add(' "',listCode,'":[');
	}
	
	idx=0;
	while( cur, node ) {
		if( idx ) rst.add(',');
		if(cur.var(useCheck)) continue;
		idx++;
		rst.add("{");
		propCheck=when(cur.tag, cur.tag.eq('object', 'array'));
		if(propCheck) {
			fieldArray=cur.keys();
		} else {
			fieldArray=fa;
			not(fieldArray) {
				fieldArray=cur.keys();
				if(checkField) fa=fieldArray;
			}
		}
		num=0;
		while( key, fieldArray ) {
			if( num ) rst.add(","); 
			val=cur.get(key);
			if(typeof(val,'node')) {
				rst.add(Cf.jsValue(key), ':', @json.nodeStr(val) );
			} else if(typeof(val,'array')) {
				rst.add(Cf.jsValue(key), ':', @json.arrayStr(val) );
			} else {
				rst.add(Cf.jsValue(key), ':', Cf.jsValue(val) );
			}
			num++;
		}
		if( cur.childCount() ) { 
			not(propCheck ) {
				if( num ) rst.add(",");
				rst.add(' "',listCode,'":', @json.listData(cur, when(checkField,null,fa), listCode, true));
			}
		}
		rst.add("}");
	}
	if(skip) {
		rst.add("]");		
	} else {
		rst.add("]}");
	}
	return rst;
}
@json.nodeStr(node, depth) {
	not(depth) depth=1;
	if(node.cmp('tag','array')) return @json.arrayStr(node, depth);
	if(depth>4) return Cf.jsValue("node");
	rst='';
	rst.add("{");
	num=0, depth+=1;
	while( key, node.keys() ) {	
		if( key.ch('@') ) continue;
		if( key.eq('children') ) continue;
		val=node.get(key);
		if(typeof(val,'func')) continue;
		if( num ) rst.add(',');
		if(typeof(val,'node')) {
			rst.add(Cf.jsValue(key), ':', @json.nodeStr(val,depth) );
		} else if(typeof(val,'array')) {
			rst.add(Cf.jsValue(key), ':', @json.arrayStr(val,depth) );
		} else {
			rst.add(Cf.jsValue(key), ':', Cf.jsValue(val) );
		}
		num++; 
	}
	rst.add("}");
	return rst;
}
@json.arrayStr(arr, depth) {
	not(depth) depth=1;
	if(depth>4) return Cf.jsValue("array");
	rst='';
	rst.add("[");
	num=0, depth+=1;
	while( val, arr ) {	
		if( key.ch('@') ) continue; 
		if(typeof(val,'func')) continue;
		if( num ) rst.add(',');
		if(typeof(val,'node')) {
			rst.add( @json.nodeStr(val,depth) );
		} else if(typeof(val,'array')) {
			rst.add(  @json.arrayStr(val,depth) );
		} else {
			rst.add( Cf.jsValue(val) );
		}
		num++; 
	}
	rst.add("]");
	return rst;
}
@json.toString(node) {
	return @json.nodeStr(node)
}
</func>
 
 
 
<func note="자바스크립트 형태로 문자열 변환">
	typeVal(&s) {
		return when(typeof(s,'string'), s.typeValue(), s);
	}
	nodeVal(param, node, base, fn) {
		not(fn) fn=Cf.funcNode('parent');
		if(_check(node, param) ) return node[$param];
		if(_check(base, param) ) return base[$param];
		return fn.get(param);
		_check = func(&s) {
			a=s.move();
			return when(node.get(a), true)
		};
	}
	jsValue(src) {
		if( typeof(src,"string")) {
			if( typeof(src,"num") || src.eq("true","false","null")) return src;
			return Cf.jsValue(src);
		}
		if( typeof(src,'number') ) {
			return src;
		}
		if( typeof(src,'bool') ) {
			return when(src, "true", "false");
		}
		if( typeof(src,'null') ) {
			return "null";
		}
		not( src ) return '""';

		return Cf.jsValue(src);
	}

	jsStringValue(&src, single) {
		not(typeof(src,'string')) {
			if(typeof(src,'bool'))return when(src, "true", "false");
			if(typeof(src,'function'))return 'function';
			if(typeof(src,'null'))return 'null';
			if(typeof(src,'num')) return src;
			return "$src";
		}
		not(src) return '""';
		c=src.ch();
		not( c ) {
			return '""';
		}
		if( c.eq() ) {
			return src;
		}
		rst='';
		rst.append('"');
		while( src.valid(), n, 0 ) {
			line=src.findPos("\n");
			ss=line;
			not( ss.ch() ) continue;
			if( line.find('\') ) {
				ss='';
				while( line.valid() ) {
					left=line.findPos('\', 0);
					ss.add(left);
					not( line.valid() ) break;
					ss.add('\\')
				}
				line=ss;
				print("-------xxx line=>$line");
			}
			if( line.find('"') ) {
				line=parseLine(line);
			}
			if( n ) rst.append('\n');
			if( line.find("\t") ) {
				str=line.replace("\t", '\t');
				rst.append( str.trim('right') );
			} else {
				rst.append( line.trim('right') );
			}
		}
		rst.add('"');
		return rst;

		parseLine=func(&src) {
			rst='';
			while( src.valid() ) {
				left=src.findPos('"');
				rst.append(left) not( src.valid() ) break;
				rst.append('\"');
			}
			return rst;
		};
	}
</func>