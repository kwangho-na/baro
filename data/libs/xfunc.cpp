bool setClassFunc(TreeNode* target, StrVar* sv, int sp, int ep, XFuncNode* fn, StrVar* rst ) {
    if( target==NULL ) return false;
    XParseVar pv(sv, sp, ep);
    XFuncSrc* fsrc=NULL; 
    XFuncNode* fnInit=NULL;
	XFuncNode* fnParent=NULL;
	TreeNode* page=getPageNode(target); 
	if( page && target!=page ) {
		sv=page->gv("onInit");
		if( SVCHK('f',0) ) {
			fnParent=(XFuncNode*)SVO;
		}
	} 
    int sa=0, ea=0;
    char c=pv.ch();
    while( pv.valid() ) {
        c=pv.ch();
        if( c==0 || c=='>' ) break;
        if( c==';' ) {
            c=pv.incr().ch();
			continue;
        } 
        if( c=='/' ) {
            c=pv.ch(1);
            if( c=='/') {
                pv.findEnd("\n");
            } else if( c=='*' ) {
                pv.match("/*", "*/", FIND_SKIP);
            }
            continue;
        }
		LPCC funcNm=NULL, funcMode=NULL, param=NULL;
		bool addMode=false, bEvt=false;
		sa=pv.start;
		c=pv.moveNext().ch()
        if( c=='#' || c=='-' ) {
            c=pv.incr().moveNext().ch();
        }
        ea=pv.start;
        funcNm=pv.Trim(sa,ea);
        if( slen(funcNm)==0 ) {
            qDebug("#9##class function error (name: %s)\n", funcNm);
            return false;
        }
        if( c=='(' && pv.match("(",")") ) {
            param=pv.v();
            c=pv.ch();
        }
        if( c!='{' ) break;
        if( pv.match("{","}",FIND_SKIP)==false ) {
			qDebug("#9##class function match error (name: %s)\n", funcNm);
			return false;
		}
		sv=target->gv(funcNm);
		if( SVCHK('f',1) ) {
			fsrc = (XFuncSrc*)SVO;
		} else if( SVCHK('f',0) ) {
			XFuncNode* fnCur=(XFuncNode*)SVO;
			XFunc* fc=fnCur->xfunc;
			fsrc=fc ? fc->getFuncSrc(): NULL;
			if( fsrc && ccmp(funcNm,"onInit") ) {
				fnInit=fnCur;
			}
		} else {
			fsrc=gfsrcs.getFuncSrc();
			addMode=true;
		}
        if( fsrc ) {
            if( addMode==false  ) {
                fsrc->reuse();
				fsrc->xparam.reuse();
				fsrc->xflag=0;
				if( fsrc->xfunc ) {
					gfuncs.deleteFunc(fsrc->xfunc);
					fsrc->xfunc=NULL;
				}
            }
            if( slen(param) ) fsrc->xparam.set(param);
            fsrc->readBuffer(pv.GetVar(), pv.prev, pv.cur);
            if( fsrc->makeFunc() && fsrc->xfunc ) {
				// qDebug("#0## object function make ok (name: %s)", funcNm);
			} else {
				qDebug("#9## class function make error (name: %s)\n", funcNm);
			}
            XFunc* func=fsrc->xfunc;
            if( StartWith(funcNm,"on") && slen(funcNm)>2 && isUpperCase(funcNm[2]) ) {
				bEvt=true;
            } 
            qDebug("#0# function : %s (%s: %s)\n", funcNm, (bEvt?"event":"func"), (addMode?"add":"modify") );
            if( addMode ) {
                if(bEvt) {
					XFuncNode* fnCur=gfns.getFuncNode(fsrc->xfunc, fn);
					fnCur->GetVar("@this")->setVar('n',0,(LPVOID)target);
					fnCur->setNodeFlag(FLAG_PERSIST);
                    if(ccmp(funcNm,"onInit")) {
						sv=target->gv("onInit");
						if(SVCHK('f',0) ) {
							fnInit=(XFuncNode*)SVO;
							fnCur->call();
							for(WBoxNode* bn=fnCur->First(); bn; bn=fnCur->Next() ) {
								LPCC varNm=fnCur->getCurCode();
								if( varNm[0]=='@' ) continue;
								if(!fnInit->gv(varNm)) {
									fnInit->GetVar(varNm)->set(bn->value);
								}
							}
							fnCur->clearNodeFlag(FLAG_PERSIST);
							funcNodeDelete(fnCur);
						} else {
							fnInit=fnCur; 
						} 
					}
                } else {
                    target->GetVar(funcNm)->setVar('f',1,(LPVOID)fsrc );
                }
            }
        }        
    }
    if(fnInit ) { 
		for(WBoxNode* bn=node->First(); bn; bn=node->Next() ) {
			sv=&(bn->value);
			if(SVCHK('f',0) ) {
				XFuncNode* fnCur=(XFuncNode*)SVO;
				if(fnCur!=fnInit) {
					fnCur->xparent=fnInit;
				}
			}
		}
	}
    return true;
}
