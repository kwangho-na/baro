## 그리드 헤더 그리기
  XFuncNode* fnDraw = getEventFuncNode(xcf, "onDrawHeader");
    if( fnDraw ) {
        // onDrawHeader(d, text, index, order);
        QString text = model()->headerData( logicalIndex, orientation(), Qt::DisplayRole).toString();
        TreeNode* d=NULL;
        StrVar* sv=fnDraw->gv("@draw");
        if( SVCHK('n',0) ) {
            d=(TreeNode*)SVO;
        } else {
            d=new TreeNode(2, true);
            d->xstat=FNSTATE_DRAW;
            d->xtype=0;
            fnDraw->GetVar("@draw")->setVar('n',0,(LPVOID)d);
        }
        PARR arrs=getLocalParams(fnDraw);
        setVarRectF(d->GetVar("@rect"), rect);
        d->GetVar("@g")->setVar('g',0,(LPVOID)painter);
        // ### version 1.0.4
        arrs->add()->setVar('n',0,(LPVOID)d);
        arrs->add()->set(Q2A(text));
        arrs->add()->setVar('0',0).addInt(logicalIndex);
        arrs->add()->setVar('0',0).addInt(xidx);          // <== 정렬인덱스
        arrs->add()->setVar('0',0).addInt(sortIndicatorOrder());
        setFuncNodeParams(fnDraw, arrs);
        fnDraw->call();
    }
## 노드 이동처리
onKeyDown(k, c) {
		root=this.model()
		if(c & KEY.ctrl) {
			 if(k==KEY.Up) {
			 	cur=this.current()
			 	node=this.firstNode(true)
			 	if(node!=cur) {
			 		idx=cur.index()
			 		root.remove(cur)
			 		root.insertNode(idx-1, cur)
			 		this.current(cur)
			 		print("idx==$idx")
			 	}
			 } else if(k==KEY.Down) {
			 	print("down")
			 } else {
			 	return false
			 }
			 return true;
		}
	}

## insert Node 함수 버그수정
case 909: {	// insertNode
        if( arrs==NULL ) {
            return false;
        }
        StrVar* sv = arrs->get(0);
        int idx=-1;
        TreeNode* cur = NULL;
        if( SVCHK('n',0) ) {
            cur = (TreeNode*)SVO;
            if( cur->parent()== node ) {
                idx=cur->row();
            }
        } else if( isNumberVar(sv) ) {
            idx=toInteger(sv);
        }
        sv = arrs->get(1);
		if( SVCHK('n',0) ) {
            cur=node->addNode();
        }
        if( idx!=-1 && idx<node->childCount() ) {
            if(cur==NULL ) {
      				cur = new TreeNode(2, true);
      			}
            cur->xparent=node;
            node->xchilds.insert(idx,cur);
        } 
        rst->setVar('n',0,(LPVOID)cur);
    } break;


## drag & drop 처리
g.is('drag', true)
g.is('drop', true)
g[
	onDrag(type,data) {
		print("drag $data =>",type )
		return 'accept'
	}
	onDrop(a,b) {
		print("drop=>",a,b)
	}
	onDragMove(pos, data) {
		print("move=> $data", pos)
		return 'accept'
	}
]


bool execObjectFunc(XFunc* fc, PARR arrs, XFuncNode* fn, StrVar* var, StrVar* rst, StrVar* origin, LPCC funcName ) {
case 'm' : {
        LPCC fnm=funcName? funcName : fc->getFuncName();
        U16 stat=var->getU16(2);
        if( stat==2 ) {
          QMimeData* mime=(QMimeData*)var->getObject(FUNC_HEADER_POS);
          if(ccmp(fnm,"text")) {
            rst->set(Q2A(mime->text());
          } else if( ccmp(fnm,"image")) {
            QByteArray ba;
    				QPixmap img = qvariant_cast<QPixmap>(md->imageData());
    				QBuffer buffer( &ba );
    				buffer.open( QIODevice::WriteOnly );
    				img.save( &buffer, "PNG" ); // writes pixmap into ba in PNG format
    				if( img.isNull() ) {
    					qDebug()<< "image is null";
    				} else if(ba.size() ) {
    					rst->setVar('i',7).addInt(ba.size()).add(ba.constData(),ba.size());
    				}
          } else if( ccmp(fnm,"html")) {
            rst->set(Q2A(mime->html());
          } else if( ccmp(fnm,"hasText")) {
            rst->setVar('3', mime->hasText()? 1:0)
          } else if( ccmp(type,"hasHtml") ) {
      			rst->setVar('3', md->hasHtml()? 1: 0);
      		} else if( ccmp(type,"hasImage") ) {
      			rst->setVar('3', md->hasImage()? 1: 0);
          } else if( ccmp(fnm,"data")) {
            LPCC type = arrs==NULL ? "application/nodeData": AS(0)
            QByteArray ba = mime->data(type);
            rst->set(ba.constData(), ba.size());
          }
        } else if( stat==3 ) {
		    }
        return true;
    } break;



