## mssql 테이블 조회
select * 
FROM
    information_schema.tables
WHERE
    table_schema = 'muknoori' and TABLE_TYPE ='BASE TABLE'
    
    
SELECT
    table_name, column_name, column_comment
FROM
    information_schema.columns
WHERE
    table_schema = 'muknoori' AND table_name = 'muk_sticke_file'    
	
	
## 달력스타일

QTextCharFormat fmt;
fmt.setForeground(QBrush(Qt::blue));
dateEdit->calendarWidget()->setWeekdayTextFormat(Qt::Saturday, fmt);
dateEdit->calendarWidget()->setWeekdayTextFormat(Qt::Sunday, fmt);

QCalendarWidget QToolButton#qt_calendar_prevmonth 
{
    qproperty-icon: url(back.png);
}
QCalendarWidget QToolButton#qt_calendar_nextmonth 
{
    qproperty-icon: url(forward.png);
}
QCalendarWidget QWidget#qt_calendar_navigationbar QMenu,
QCalendarWidget QWidget#qt_calendar_navigationbar QSpinBox 
{
    background-color: #152C4A;
    color: white;
}

## 페이지 정보 노드정보
node=_node()
node.parseJson(#[
	tag:combo, id:rangeType, data:[
		{code:vbox,text:세로박스}
		{code:hbox, text:가로박스}
		{code:abs, text:영역이동}
		{code:relative, text:상대영역}
		{code:grid, text:그리드}
		{code:free, text:자유영역}
	],
	action:focus
])
print("node=$node")


## 트리 필터사용
initClass() {
	c=this;
	@tree=c.addWidget('tree','temp')
	@input=c.addWidget('input','funcName', rc(10,10,100,30))
	tree.model('text')
	node=tree.model()
	node.addNode().with(text:'bbbb')
	input.treePopup(tree)
	tree.setEvent('onFilter', this.treeFilter, this)
	input.setEvent('onTextChange', this.inputChange, this)
}
inputChange() {
	val=target.value()
	tree.update()
}
treeFilter(node) {
	filter=input.value()
	not(filter) return;
	if(node.text.find(filter)) return true;
	return false;
}