
int XFuncNode::callFor(XFunc* fc, StrVar* rst) {
    if( !fc )
        return 0;
    int psize=fc->xparams.size();
    int rtn = 0;
    if( psize==0 ) {
        qDebug("#9#while param error (param count:%d)", psize);
        return FTYPE_RETURN;
    }
    LPCC vnm=NULL;
    XFunc* param = fc->getParam(0);
    int sp=0, ep=0xFFFF;
    int bnum=0;
    char vid[64]={0,};
    if( param->getType()==FTYPE_VAR ) {
		XFunc* fcFunc=fc->getParam(1);
		if( fcFunc && fcFunc->xftype==FTYPE_FUNC ) {
			// while(n, range(10) ) ...
			StrVar* sv=rst;
			execFunc(fcFunc,this,sv);
			
			
		} else if(psize==1 && param->getParam(0)==NULL) {
			execFunc(param,this,rst);
			if(isNumberVar(rst) ) {
				bnum=toInteger(rst);
			} else {
				rst->reuse();
			}
		}
    }
    if( bnum>0 || param->getType()==FTYPE_NUMBER ) {
        if( psize==2 ) {
            XFunc* fcVar=fc->getParam(1);
            if( fcVar && fcVar->xftype==FTYPE_VAR ) {
                vnm=fcVar->getValueBuf(vid,64);
            }
        }
        if(bnum>0) {
            ep=bnum;
        } else {
            execFunc(param,this,rst);
            ep=toInteger(rst);
        }
        rst->reuse();
        for(int n=0; n<ep; n++ ) {
            if(vnm) {
                this->setInt(vnm,n);
            }
            rtn = callSubFuncs(fc,this,rst);
            if( rtn==FTYPE_BREAK || rtn==FTYPE_RETURN )
                break;
        }
        return rtn;
    }


    if( param->getParam(0) && param->getParam(0)->getType()==FTYPE_OPER  ) {
        // ex) while(n=0,n<sz,n++)
        XFunc* fcCheck=NULL;
        XFunc* fcIncr=NULL;
        if( param->xftype!=FTYPE_VAR || param->xdotPos>0 ) {
            qDebug("#9#while var type error");
            return FTYPE_RETURN;
        }
        vnm=param->getValueBuf(vid,64);
        if( slen(vnm)==0 ) {
            qDebug("#9#while var error");
            return FTYPE_RETURN;
        }
        if(psize==1) {
            fcCheck=param;
        } else if( psize==2) {
            fcCheck = param;
            fcIncr = fc->getParam(1);
        } else if( psize==3 ) {
            fcCheck = fc->getParam(1);
            fcIncr = fc->getParam(2);
            execParamFunc(param, this, rst);
            if( isNumberVar(rst) ) {
                sp=toInteger(rst);
            } else {
                sp=0;
                this->GetVar(vnm)->setVar('0',0).addInt(sp);
            }
        } else {
            qDebug("#9#while param error (param count:%d)", psize);
            return FTYPE_RETURN;
        }

        if(fcCheck==param) {
            StrVar* sv=this->gv(vnm);
            if( isNumberVar(sv) ) {
                sp=toInteger(sv);
            } else {
                sp=0;
                GetVar(vnm)->setVar('0',0).addInt(sp);
            }
        }
        if( fcCheck  ) {
            for( int n=sp; n<ep; n++ ) {
                if( !isFuncTrue(fcCheck, this, rst) ) {
                    break;
                }
                rtn = callSubFuncs(fc,this,rst);
                if( rtn==FTYPE_BREAK || rtn==FTYPE_RETURN )
                    break;
                if( fcIncr ) {
                    execParamFunc(fcIncr, this, rst);
                }
            }
        } else {
            qDebug("#9#while check func error(var:%s)\n", vnm);
        }
    } else if( param->xftype==FTYPE_FUNC ) {
        // ex) while(s.valid(), idx)
        XFunc* fcCheck=param;
        param = fc->getParam(1);
        if( param && param->xftype==FTYPE_VAR ) {
            vnm=param->getVarBuf(vid,64);
            GetVar(vnm)->setVar('0',0).addInt(0);
        }
        for( int n=sp;n<ep; n++ ) {
            if( slen(vnm) ) {
                GetVar(vnm)->setVar('0',0).addInt(n);
            }
            if( !isFuncTrue(fcCheck, this, rst) ) {
                break;
            }
            rtn = callSubFuncs(fc,this,rst);
            if( rtn==FTYPE_CONTINUE )
                continue;
            if( rtn==FTYPE_BREAK || rtn==FTYPE_RETURN )
                break;
        }
    } else if( param->xftype==FTYPE_VAR ) {
        
		XListArr* arr = NULL;
		TreeNode* loopNode = NULL;
		char currentVar[32]={0,};
		LPCC curNm=param->getVarBuf(currentVar,32);
		
		StrVar* sv = rst;
		param = fc->getParam(1);
		execFunc(param, this, sv->reuse() );
		if( isNumberVar(sv) ) {
			ep=toInteger(rst);
			if(sp<ep ) {
				for( int n=sp; n<ep; n++ ) {
					if( slen(curNm) ) {
						GetVar(curNm)->setVar('0',0).addInt(n);
					}
					rtn = callSubFuncs(fc,this,rst);
					if( rtn==FTYPE_CONTINUE )
						continue;
					if( rtn==FTYPE_BREAK || rtn==FTYPE_RETURN )
						break;
				}
			} else if(sp>ep ) {
				for( int n=sp; n>=ep; n-- ) {
					if( slen(curNm) ) {
						GetVar(curNm)->setVar('0',0).addInt(n);
					}
					rtn = callSubFuncs(fc,this,rst);
					if( rtn==FTYPE_CONTINUE )
						continue;
					if( rtn==FTYPE_BREAK || rtn==FTYPE_RETURN )
						break;
				}
			}
		} else {
			if( SVCHK('n',0) ) {
				loopNode = (TreeNode*)SVO;
			} else if( SVCHK('a',0) ) {
				arr = (XListArr*)SVO;
			} else {
				// qDebug("#1#while object error--> %s %s", curNm, vnm);
				return 0;
			}
			param = fc->getParam(2);
			if( param && param->xftype==FTYPE_VAR ) {
				vnm=param->getVarBuf(vid, 64);
				// strncpy(vid, param->getVarName(), 32);
			}
			//
			int total=arr?arr->size(): loopNode? loopNode->childCount(): 0;
			for( int n=sp; n<ep; n++ ) {
				if( slen(vnm) ) {
					GetVar(vnm)->setVar('0',0).addInt(n);
				}
				if( total<=n )
					break;
				if( arr ) {
					GetVar(curNm)->reuse()->add(arr->get(n));
				} else if( loopNode ) {
					TreeNode* cur=loopNode->child(n);
					if( cur ) {
						GetVar(curNm)->setVar('n',0,(LPVOID)cur);
					} else {
						break;
					}
				} else {
					break;
				}
				rtn = callSubFuncs(fc,this,rst);
				if( rtn==FTYPE_CONTINUE )
					continue;
				if( rtn==FTYPE_BREAK || rtn==FTYPE_RETURN )
					break;
			} 
		}
    } else {
        qDebug("#9#while param error (param count:%d)", psize);
        return FTYPE_RETURN;
    }
    return rtn;
}

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
