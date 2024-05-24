<func note="파일시스템 함수모음">

	@template.parse(&s, name, node, root, localCheck) {
		nl="\r\n";
		eventCheck=false
		not(root) {
			eventCheck=true
			root=node;
		}
		ss='';
		while(s.valid()) {
			left=s.findPos('@@')
			ss.add(left)
			not(s.ch()) break;
			if(templateCheck(s)) {
				sp=s.cur()
				c=s.next().ch()
				while(c.eq('-')) c=s.next().ch()
				ty=s.trim(sp,s.cur());
				templateProps='';
				if(s.ch('(') )
					varName=s.match().trim()
				else
					varName=ty;
				if(s.ch('{')) {
					templateProps=s.match(1)
				}
				if(ty.eq('start','end','onStart', 'onEnd')) {
					not(templateProps) continue;
					// @@start{}
					if(ty.eq('start')) ty='onStart';
					if(ty.eq('end')) ty='onEnd';
					subName=nvl(name, "store")
					val=@template.parse(templateProps, subName, node, root)
					root.appendText("#$ty", val);
				} else if(ty.eq('if','not')) {
					tagUse=false;
					not(templateProps) {
						if(s.ch('<')) {
							sp=s.cur()
							c=s.incr().next().ch()
							while(c.eq('-')) c=s.incr().next().ch()
							tag=s.trim(sp+1,s.cur(),true)
							s.pos(sp)
							a=s.match("<$tag","</$tag>")
							if(typeof(a,'bool')) {
								a=s.findPos("</$tag>")
								templateProps=Cf.val(a,"</$tag>")
							} else {
								templateProps=Cf.val("<$tag",a,"</$tag>")
							}
							tagUse=true;
						}
					}
					chk=node.get(varName)
					v=templateProps;
					if(ty.eq('if')) {
						not(chk) v=''
					} else {
						if(chk) v=''
					}
					not(v) continue;
					print("xxxxxxx", ty, varName, chk, v)
					if(tagUse) {
						src=@template.parse(v,name,node,root);
						ss.add(src)
					} else {
						if(v.eq('@@')) {
							v=node.get(varName)
						} else {
							str=''
							if(v.find('@@')) {
								val=node.get(varName)
								if(v.find('@@',1)) {
									// @@if(id)[id=@@]
									left=v.findPos('@@')
									c=left.ch(-1,true)
									str.add(left)
									if(c.eq('=',':')) {
										c=val.ch()
										if(typeof(val,'num')) str.add(val)
										else if(val.eq('true','false','null')) str.add(val)
										else if(c.eq('{','[','(')) str.add(val)
										else if(val.find("\n")) str.add('`',val,'`')
										else str.add(Cf.jsValue(val))
										str.add(v)
									} else {
										str.add(val,v)
									}
								} else {
									// id='@@' 문자열안에 @@ 포함
									left=v.findPos('@@')
									str.add(left)
									str.add(val,v)
								}
								print("xxxxxxxxx str==$str", varName)
								v=str;
							}
						}
						ss.add(v)
					}
				} else if(ty.eq('js')) {
					// @@js{}
					props=parseJson(templateProps, name, node, root)
					src=conf("xtemplate.js/$varName");
					if(src.find("<script")) src=@template.removeTag("script",src)
					if(src.find('@@')) src=@template.parse(src,name,props,root);
					ss.add(src)
				} else {
					// @@template(name) {props}
					props=parseJson(templateProps, varName, node, root)
					not(prop.isset('name') ) prop.name=varName
					if( props.isset('init') ) {
						val=@template.parse(props.init, varName, props, root)
						print("xxx template init name==$name", props);
						root.appendText("#onInit", val);
					}
					root.set("#$varName", varName)
					val=@template.parse(conf("xtemplate.$ty"), varName, props, root)
					ss.add(val)
				}
			} else if(varCheck(s)) {
				// @@color[red] 또는 @@if()[]
				k=s.move()
				if(s.ch('(')) {
					p=s.match().trim()
					if(s.ch('[')) {
						v=s.match()
					}
					if(k.eq('ref')) {
						refNm=name;
						not(refNm) {
							idx=root.incrNum('refIndex')
							refNm="ref_$idx"
						}
						if(p.eq('true')) {
							ss.add(':ref="o=>xx.',refNm,'Ref=o" v-model="xx.',refNm,'Val"')
						} else if(p) {
							ss.add(':ref="o=>xx.',p,'Ref=o"')
						} else {
							ss.add(':ref="o=>xx.',refNm,'Ref=o"')
						} 
					} else if(k.eq('parent')) {
						if(p.find('.')) {
							p.split('.').inject(a,b)
							ss.add("store.${a}_${b}");
						} else {
							ss.add("store.${p}");
						} 
					} else if('inc') {
						path=p.trim();
						pathRoot=webRoot();
						not(path.find('.')) path.add('.html')
						if(path.ch('/')) {
							pathRoot.add(path)
						} else {
							pathRoot.add('/template/',path)
						}
						print("inc pathRoot=======$pathRoot");
						ss.add(fileRead(pathRoot))
					} else if(k.eq('append','add')) { 
						val=conf("xtemplate.$p")
						if(val) ss.add(val)
					} else {
						print("$k 내부함수 미정의");
					}
					continue;
				}
				val=node.get(k);
				if(s.ch('[')) {
					v=s.match()
					if(v.ch('=')) {
						// @@style[=background:#aaa;]
						a=v.trim(1)
						v=Cf.val(k,'=',Cf.jsValue(a))
					} else if(v.start('array',true)) {
						v=Cf.val('[',v,']')
					}
				}
				ok=true;
				if(val) {
					c=left.ch(-1,true)
					if(c.eq('=',':')) {
						ok=false;
						if(typeof(val,'num')) ss.add(val)
						else if(val.eq('true','false','null')) ss.add(val)
						else if(c.eq('{','[','(')) ss.add(val)
						else if(val.find("\n")) ss.add('`',val,'`')
						else ss.add(Cf.jsValue(val))
					}
				} else {
					if( v.eq('*')) {
						val=root.get(k)
					} else {
						val=@template.parse(v,naem,node,root,true);
					}
				}
				if( ok && val ) ss.add(val)
			} else if(reserveCheck(s)) {
				k=s.move()
				if(k.eq('ref')) {
					if(name) {
						ss.add(':ref="o=>xx.',name,'Ref=o" ')
					} else {
						idx=root.incrNum('refIndex')
						refNm="ref_$idx"
						ss.add(':ref="o=>xx.',refNm,'=o"')
					}
				} else {
					src=node.get(k)
					if(src) { 
						val=@template.parse(src, name, node, root);
						ss.add(val)
					}
				}
			} else {
				ss.add('@@')
			}
		}
		if(localCheck) return ss;
		src=makeTemplate(ss,name,node,root);
		if(eventCheck) {
			evt=pageEvent();
			if(evt) {
				src=eventAdd(src,evt)
			}
		}
		return src;
		
		eventAdd=func(&s, evt) {
			ss='';
			if(root.templateEventUse ) {
				left=s.findLast('</template>');
				remain=left.right();
				ss.add(left,nl,"<script>",nl,evt,"</script>",nl,'</template>',nl,remain);
			} else if(s.find('</script>')) {
				left=s.findLast('</script>');
				remain=left.right();
				ss.add(left,nl,evt,nl,'</script>',nl,left.right());
			} else {
				ss.add(s,nl,evt)
			}
			return ss;
		};
		pageEvent=func() {
			se=root.get("#onStart"), ee=root.get("#onEnd")
			init=root.get("#onInit");
			ss=''
			if(se) ss.add("store.onStart = () => {${se}}", nl)
			if(ee) ss.add("store.onEnd = () => {${ee}}", nl)
			if(init) ss.add(init, nl);
			return ss;
		};
		reserveCheck = func(&s) {
			name=s.move()
			return name.eq('ref','props','class','style','content')
		};
		varCheck = func(&s) {
			s.next()
			if(s.ch('[','(')) return true;
			return false;
		};
		parseJson=func(&s, name, parent, root) {
			node=_node()
			if(parent) {
				node.parent=parent
			} else {
				parent=root;
			}
			while(s.valid()) {
				c=s.ch()
				not(c) break;
				if(c.eq(',',';')) {
					s.incr()
					continue;
				}
				if(c.eq()) k=s.match() else k=s.move()
				c=s.ch()
				if(c.eq('{')) {
					// todo 키가 props 경우 자동으로 @click= :style= 식으로 붙여주는 기능구현 
					node.set(k,s.match(1))
					continue;
				}
				if(c.eq('<')) {
					tag=s.incr().move()
					src=s.findPos("</$tag>");
					src.findPos(">");
					parentName=parent.name;
					not(parentName) parentName=name;
					node.set(k, @template.parse(src, parentName, parent, root) )
					continue;
				}
				not(c.eq(':','=')) break;
				c=s.incr().ch()
				if(c.eq()) {
					val=s.match();
				} else if(c.eq('(')) {
					val=s.match(1);
					c=s.ch()
					if(s.start('=>', true)) {
						if(s.ch('{')) {
							val=s.match(1)
						} else {
							val=s.findPos("\n")
						}
					} else if(c.eq('{')) {
						val=s.match(1)
					} 
					if(typeof(val,'bool')) val="$k 매칭오류";
				} else if(c.eq('{','[')) {
					if(k.eq('props')) {
						val=s.match(1)
					} else {
						ec=when(c.eq('{'),'}',']')
						a=s.match(1)
						if(typeof(a,'bool')) val="$k 매칭오류";
						else val=Cf.val(c,a,ec)
					}
				} else if(c.eq('<')) {
					sp=s.cur()
					c=s.incr().next().ch()
					while(c.eq('-')) c=s.incr().next().ch()
					tag=s.trim(sp+1, s.cur())
					s.pos(sp)
					a=s.match("<$tag","</$tag>")
					if(k.eq('start','end')) {
						if(tag.eq('script')) {
							if(k.eq('start')) k='onStart';
							if(k.eq('end')) k='onEnd';
							a.findPos(">"); 
							a=@template.parse(a, name, node, root)
							root.appendText("#$k", a);
						}
						continue;
					} 
					if(typeof(a,'bool')) {
						val="$tag 매칭오류";
						s.findPos("</$tag>")
					} else {	
						if(a.find("@@")) a=@template.parse(a, name, node, root)
						val=Cf.val("<$tag",a,"</$tag>")					
					}					
				} else {
					if(lineCheck(s,',')) 
						val=s.findPos(',').trim()
					else 
						val=s.findPos(" \t\n",4).trim()
				}
				node.set(k, val)
			}
			return node;
		};
		 
		templateCheck=func(&s) {
			ty=s.move()
			print("templateCheck type==$ty")
			if(ty.eq('if','not')) {
				not(s.ch('(')) return false;
				s.match();
				if(s.ch('{','<')) return true;
			} else {
				c=s.ch()
				while(c.eq('-')) c=s.next().ch();
				if(s.ch('(')) s.match()
				if(s.ch('{')) return true;
			}
			return false;
		};
		 
		makeTemplate = func(&s, name, node, root) {
			ss=''
			while(s.valid()) {
				left=s.findPos('x')
				ss.add(left)
				c=left.ch(-1)
				if(c.is('alphanum')) {
					ss.add('x');
					continue;
				}
				sp=s.cur();
				not(s.ch()) break;
				if(s.ch('(')) {
					// x(config)
					p=s.match()
					c=p.ch()
					if(c.eq()) {
						pn=p.match()
					} else {
						pn=p.trim()
					}
					ss.add("xui.require('$pn')")
				} else if(s.ch('x')) {
					// xx.aaa
					c=s.ch(1)
					if(c.eq('.')) {
						if(name) {
							ss.add("store.$name", '_')
						} else {
							ss.add('store.');
						}
						s.incr(2)
					} else if(c.eq('_')) {
						if(name) {
							ss.add("$name", '_')
						} else {
							ss.add('xx_');
						}
						s.incr(2)
					} else if(c.eq('(')) {	
						// xx(global)
						s.incr()
						p=s.match()
						c=p.ch()
						if(c.eq()) {
							pn=p.match()
						} else {
							pn=p.trim()
						}
						ss.add("xui.store('$pn')")
					} else if(checkDot(s)) {
						// xx1.
						k=s.move()
						v=root.get("#$k")
						if(v) {
							ss.add("store.$v", '_')
						} 
					} else {
						ss.add('x')
						s.incr(1)
					}
				} else if(checkDot(s)) {
					// x1.name
					k=s.move()
					if(k=='ui') {
						ss.add('xui.')
					} else {
						v=root.get("#$k")
						if(v) {
							ss.add("store.$v", '_')
						}
					}
					s.incr()
				} else {
					if(sp<s.cur()) s.pos(sp);
					ss.add('x')
				}
			}
			return ss;
		};
		checkDot=func(&s) {
			c=s.next().ch()
			return c.eq('.')
		};
	}
	@template.removeTag(tag, &s) {
		ss="", ts="<$tag", te="</$tag>";
		while(s.valid()) {
			left=s.findPos(ts,0,1)
			ss.add(left)
			not(s.ch()) break;
			a=s.match(ts,te)
			if(typeof(a,'bool')) {
				s.findPos(">")
				a=s.findPos(te);
			} else {
				a.findPos(">");
			}
			ss.add(a);
		}
		return ss;
	}
</func>
