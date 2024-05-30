class string {
	jsonList(node, fields) {
		return @json.list(node, fields, 'children')
	}
}

class func:json {
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
}


class func:format {
	ff(&s) {
		fn=Cf.funcNode('parent')
		a=args(1)
		ss=''
		while(s.valid()) {
			left=s.findPos('{')
			ss.add(left)
			not(s.valid()) break;
			k=s.findPos('}').trim()
			if(typeof(k,'num')) ss.add(a.get(k))
			else ss.add(fn.get(k))
		}
		return ss
	} 
	format(&s, map) {
		fn=Cf.funcNode('parent'); 
		not(typeof(map,'node')) map=this;
		a=args(1);
		rst='';
		Cf.rootNode("@callFuncNode", fn);
		while(s.valid()) {
			left=s.findPos('#{');
			rst.add(left);
			not(s.ch()) break;
			k=s.findPos('}')
			ch=k.ch();
			not(ch) continue;
			if(ch.eq('[')) {
				src=k.match();
				v=map[$src];
				rst.add(v);
			} else {
				key=k.findPos(',').trim();
				if(typeof(key,'num')) {
					v=a.get(key);
				} else {
					if(fn.isset(key)) {
						v=fn.get(key);
					} else if(map) {
						v=map[$key];
					}
				}
				if(v || typeof(v,'num')) {
					endVal='';
					if(k.ch('[')) {
						ty=k.match();
						if(ty.find('@')) {
							startVal=ty.findPos('@');
							endVal=ty;
							rst.add(fmt(startVal)); 
						} else {
							if(ty.eq('ln')) rst.add("\n"); 
							else if(ty.eq('tab')) rst.add("\t");
							else if(ty.eq('comma')) rst.add(",");
							else if(ty.eq('space')) rst.add(" ");
							else rst.add(fmt(ty));
						}
					}
					rst.add(v);
					if(endVal) rst.add(fmt(endVal));
				} else if(k.valid()) {
					if(k.ch('[')) {
						k.match();	
					}
					if(k.ch()) rst.add(k);
				}
			}
		}
		Cf.rootNode("@callFuncNode",null);
		return rst;
	}
	dateFormat(tm) {
		if(typeof(tm,'string') ) {
			if(tm.size().eq(8)) {
				yy=tm.value(0,4), mm=tm.value(4,6), dd=tm.value(6);
				return "${yy}-${mm}-${dd}";
			}  
		}
		if( typeof(tm,'num') ) {
			today=System.date('yyyy-MM-dd');
			date=System.date(tm,'yyyy-MM-dd');
			if( today.eq(date) ) {
				return System.date(tm,'hh시 mm분');
			} else {
				return date;
			}
		} 
		return '';
	}
	getTm(tm) {
		today=System.date('yyyy-MM-dd');
		not(tm) return today;
		date=System.date(tm,'yyyy-MM-dd');
		if( today.eq(date) ) {
			return System.date(tm,'hh시 mm분');
		} else {
			return date;
		}
	}
}

class func:xml {
	parseXml(node, &data ) {
		while( data.valid() ) {
			ch=data.ch();
			not( ch.eq('<') ) {
				break;
			}
			if( data.ch(1).eq('!') ) {
				data.match('<!--','-->');
				continue;
			} 
			sp=data.cur();
			ch=data.incr().next().ch();
			while(ch.eq("-")) {
				ch=data.incr().next().ch();
			}
			ep=data.cur();
			tag=data.trim(sp+1,ep);
			sub = node.addNode();
			
			in=data.find('>');
			if( in.ch(-1).eq('/') ) {
				prop=data.findPos('/>');
				parseProp( sub, tag, prop);
			} else {
				data.pos(sp);
				in=data.match("<$tag","</$tag>",8);
				not( in ) {
					print("xml parse 오류 (태그:$tag 매칭되는 태그를 찾을수 없습니다)");
					in=data.findPos("</$tag>");
				}
				prop=in.findPos(">");
				parseProp( sub, tag, prop);
				if( tag.eq('html', 'text') ) {
					sub.data=in;
				} else {
					if( in.ch().eq('<') ) {
						parseXml(sub, in);
					} else {
						sub.data=in;
					}
				}
			}
		}
		return node;
	}
	parseProp(node, tag, &prop) {
		node.tag=tag;
		while( prop.valid() ) {
			k=prop.findPos('=').trim();
			not(k) break;
			ch=prop.ch();
			if( ch.eq() ) {
				node.set(k, prop.match() );
			} else {
				val=prop.findPos(" \t\n",4).trim();
				node.set(k, val);
			}
		}
	}
}

class func:parse {
		splitSep(&s, sep, arr) {
		not(sep) sep=',';
		if(arr) arr.reuse() else arr=[];
		while(s.valid()) {
			val=s.findPos(sep).trim();
			arr.add(val);
		}
		return arr;
	}
	priceComma( val ) {
		if( typeof(val,'string')) {
			won=val.trim();
		}else if( typeof(val,'number') ) {
			won="$val";
		}
		not( won.is('number') ) {
			return won;
		}
		pv=null;
		if(won.find('.')) {
			pv=right(won,'.');
			won=won.findPos('.').trim();
		}
		s='', sign='';
		ch=won.ch();
		if( ch.eq('-','+') ) {
			sign=ch;
			w=won.value(1);
		} else {
			w=won;
		}
		size=w.size();
		sp= size % 3;
		if( sp ) {
			s.add( w.value(0,sp) );
			size-=sp;
		}
		while( n=0, n<8, n++ ) {
			if( size<=0 ) break;
			if( sp ) s.add(',');
			ep=sp+3;
			s.add( w.value(sp,ep) );
			sp=ep;
			size-=3;
		}
		if(pv) s.add('.', pv);
		return "${sign}${s}";
	}
	getColorStr(&s) {
		if(s.find(',')) {
			s.split(',').inject(r,g,b);
			c=color(r,g,b);
			return "$c";
		}
		return s;
	}
	tagBody(&s, tag) {
		s.findPos("<$tag",0,1);
		if(s.valid()) {
			ss=s.match("<$tag","</$tag>");
			if(typeof(ss,'bool')) return print("tag body match error tag:$tag");
			ss.findPos(">");
			return ss;
		}
		return;
	}
	propVal(&prop, key) {
		while(prop.valid()) {
			prop.findPos(key);
			ch=prop.ch();
			not(ch) break;
			if(ch.eq('=',':') ) {
				ch=prop.incr().ch();
				if(ch.eq()) {
					val=prop.match().value();
				} else {
					val=prop.findPos(' ').trim();
				}
				return val;
			}
		}
		return;
	}
	isEmpty(&s) {
		not(s) return true;
		not(s.ch()) return true;
		return false;
	}
	lineEndCheck(&s, sep) { 
		not(sep) sep=',';
		left=s.findPos("\n");
		if(left.find(sep,1)) return false;
		return true;
	} 
	lineBlankCheck(&s ) { 
		not(typeof(s,'string')) return false;
		c=s.ch(0);
		if(c.eq("\r","\n")) return true;
		sp=s.indexOf("\n") 
		s.ch();
		ep=s.cur();
		if(sp!=-1) {
			if(sp<ep) return true;
		}
		return false;
	} 
	lineCheck(&s, val) {
		line=s.findPos("\n");
		if(line.find(val)) return true;
		return false;
	}
	indentCount(&s) {
		sp=s.cur() s.ch();
		cp=s.cur();
		if(cp<sp) return 0;
		return cp-sp;
	}
	leftVal(&s,sep) {
		not(sep) sep='.';
		return s.findPos(sep).trim();
	}
	rightVal(&str, sep ) {
		not(sep) sep='.';
		a=str.findLast(sep);
		if( a.valid() ) {
			return a.right().trim();
		} else {
			return a;
		}
	}
	indentText( &s ) {
		not( s ) return '';
		sp=s.cur();
		s.ch();
		ep=s.cur();
		return s.value(sp,ep,true);
	}

	splitLine(&s, sep) {
		ss="";
		n=0;
		while(s.valid()) {
			line=s.findPos("\n");
			not(line.ch()) continue;
			if(n && sep) ss.add(sep);
			ss.add(line.trim());
		}
		return ss;
	}
	split(&str, sep, arr) {		
		not(arr) arr=when(sep,_arr(),[]);
		not(sep) sep=",";
		while(str.valid()) {
			val=str.findPos(sep).trim();
			if(val) arr.add(val)
		}
		return arr;
	}
	splitComma(&s) {
		return s.split(",");
	}
		
	findNumberPos(&s) {
	  while(s.valid() ) {
		pos=s.cur();
		val=s.move()
		if( val.is('num') ) return pos;
	  }
	  return s.cur();
	}
	lpad(val, num) {
		not( num ) num=4;
		if( typeof(val,'number') ) {
			strVal="$val";
		} else {
			strVal=val.trim();
		}
		sz=strVal.size();
		if( num.gt(sz) ) {
			rst='';
			dist=num-sz;
			while( n=0, n<dist, n++ ) rst.add('0')
			rst.add(strVal);
			return rst;
		} else {
			return strVal;
		}
	}
	
}

class func:convert {
	toString(obj, detail, skip, level) {
		not( level ) level=0;
		arrNode=_arr();
		rst=''
		if( typeof(obj, 'node') ) {
			arrNode.add(obj);
			parseNode(obj, level, skip );
		} else if( typeof(obj, 'array') ) {
			parseArray(obj, level );
		} else if( typeof(obj, 'string') ) {
			parseString(obj);
		} else if( typeof(obj, 'number') ) {
			return obj.toString();
		} else if( typeof(obj, 'null') ) {
			return "null";
		} else if( typeof(obj, 'bool') ) {
			return when(obj, 'true', 'false' );
		} else {
			rst=typeof(obj);
			if( level ) {
				rst.append("\n\t$obj\n");
			}
		}
		return rst;	
		parseMember=func(&s) {
			rst='';
			while(s.valid()) {
				line=s.findPos("\n").trim();
				not(line) continue;
				rst.add("\n\t",line);
			}
			return rst;
		};
		parseString=func( &str ) {
			str.ch();
			if( str.find("\n") ) {
				rst.append( str.findPos("\n").trim() );
			} else
			rst.append( str.trim() );
		};
		parseNode=func(node, depth, skip) {
			rst.append("{");
			cnt=node.childCount();		
			/*
			if( cnt ) rst.append(" 자식수: $cnt");
			fn=Cf.funcNode("onInit", node);
			if(typeof(fn,"func")) {
				rst.append(" 내부변수: \n", fn.get());
			}
			*/
			num=depth+1;
			not(skip) {
				fn=Cf.funcNode(node);
				if(fn) {
					rst.add("member [ ", parseMember(fn.get()), " ]\n");		
				}
				arr=node.keys(true).sort();
				while( key, arr ) {
					if( key.eq('@this', '@c', '@inlineNode', '@widget', '@timers', '@keys', '@,') ) continue;
					while(n=0, n<num, n++ ) rst.append(when(n.eq(0),"\n"), "\t");
					val=node[$key]
					if( typeof( val, 'num') ) {
						rst.append("$key=$val");
					} else if( typeof(val, 'bool') ) {
						rst.append("$key=", when(val,'true','false') );
					} else if( typeof(val, 'pair') ) {
						rst.append("$key=$val");
					} else if( typeof(val, 'null') ) {
						rst.append("$key=null");
					} else if( typeof(val, 'string') ) {
						rst.append("$key=");
						parseString(val);
					} else if( typeof(val, 'widget') ) {
						rst.append("$key=", typeof(val) );
					} else if( typeof(val, 'node') ) {
						find=null;
						while( cur, arrNode ) {
							if( cur==val ) {
								find=cur;
								break;
							}
						}
						if( find ) {
								rst.append("$key=", typeof(val) );
						} else {
							if( num<3 ) {
								arrNode.add(val);
								rst.append("$key=" );
								parseNode(val, num);
							} else {
								rst.append("$key=", typeof(val) );
							}
						}
					} else if( typeof(val, 'array') ) {
						rst.append("$key=" );
						parseArray(val, num);
					} else {
						rst.append("$key=$val");
					}
				}
			}
			if( detail && cnt ) {
				while(n=0, n<num, n++ ) rst.append(when(n.eq(0),"\n"), "\t");
				num++;
				rst.append("children [ ");
				if( num<5 ) {
					while( sub, node, n, 0 ) {
						if( n ) rst.append(', ');
						rst.append( toString(sub, true, false, depth+1) );
					}
				} else {
					while( sub, node ) {
						while(n=0, n<num, n++ ) rst.append(when(n.eq(0),"\n"), "\t");
						rst.append("$sub");
					}
				}
				num--;
				while(n=0, n<num, n++ ) rst.append(when(n.eq(0),"\n"), "\t");
				rst.append("]");
			}
			if( depth.eq(0) ) {
				if( type ) {
					rst.append("\n");
				} else {
					rst.append("\n}" );
				}
			} else {
				while(n=0, n<depth, n++ ) rst.append(when(n.eq(0),"\n"), "\t");
				rst.append("}");
			}
		};
		parseArray=func(arr, depth) {
			rst.append("[");
			num=depth+1;
			chk=true;
			while( val, arr, idx, 0 ) {
				if( idx ) rst.append(",");
				if( chk ) {
					while(n=0, n<num, n++ ) rst.append(when(n.eq(0),"\n"), "\t");
				}
				if( typeof( val, 'num') ) {
					rst.append(val);
				} else if( typeof(val, 'bool') ) {
					rst.append(when(val,'true','false') );
				} else if( typeof(val, 'pair') ) {
					rst.append("$val");
				} else if( typeof(val, 'string') ) {
					parseString(val);
				} else if( typeof(val, 'widget') ) {
					rst.append(typeof(val) );
				} else if( typeof(val, 'node') ) {
					find=null;
					while( cur, arrNode ) {
						if( cur==val ) {
							find=cur;
							break;
						}
					}
					if( find ) {
							rst.append(typeof(val) );
					} else {
						if( num.lt(3) ) {
							arrNode.add(val);
							parseNode(val, num)
						} else {
							rst.append( typeof(val) );
						}
					}
				} else if( typeof(val, 'array') ) {
					parseArray(val, num);
				} else {
					rst.append(val);
				}
			}
			if( depth.eq(0) ) {
				rst.append("\n]" );
			} else {
				while(n=0, n<depth, n++ ) rst.append(when(n.eq(0),"\n"), "\t");
				rst.append("]");
			}
		};
	}

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
}

