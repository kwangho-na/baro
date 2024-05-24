<func>
excelDown() {
		e=Baro.excel()
		e.open('data/excel/template.xlsx')
		e.sheet('업무보고')
		f1=e.format('A1', true)
		f2=e.format('A2', true)
		f3=e.format('A3', true)
		f4=e.format('A4', true)
		
		node=db.selectAll("select * from baro_page1 order by work_dt");
		cur=node.child(0);
		row=2;
		prev=cur.work_dt;
		date=dateFormat(prev)
		e.write(row, 1, e.format(f2), "기준일: ${date}");
		row=4;
		fmt=e.format(f4);
		while(cur, node) {
			not( cur.cmp('work_dt',prev)) {
				prev=cur.work_dt;
				date=dateFormat(prev);
				e.merge("A$row:C$row", e.format(f2), "기준일: ${date}");
				row++;
			}
			e.write(row, 1, fmt, cur.cell0, null, 'text' );
			e.write(row, 2, fmt, cur.cell1, null, 'text' );
			e.write(row, 3, fmt, cur.cell2, null, 'text' );
			print(">> cur==$cur", row);
			row++;
		}
		
		print("end");
		e.sheet('매출현황');
		print(">> 매출현환 시작");
		node=db.selectAll("select * from baro_page2 order by work_dt");
		cur=node.child(0);
		row=2;
		prev=cur.work_dt;
		date=dateFormat(prev)
		e.write(row, 1, e.format(f2), "기준일: ${date}");
		row=4;
		while(cur, node) {
			not( cur.cmp('work_dt',prev)) {
				prev=cur.work_dt;
				date=dateFormat(prev);
				e.merge("A$row:F$row", e.format(f2), "기준일: ${date}");
				row++;
			}
			e.write(row, 1, fmt, cur.cell0);
			e.write(row, 2, fmt, cur.cell1);
			e.write(row, 3, fmt, cur.cell2);
			e.write(row, 4, fmt, cur.cell3);
			e.write(row, 5, fmt, cur.cell4);
			e.write(row, 6, fmt, cur.cell5);
			row++;
		}
		
		e.sheet('공지사항')
		node=db.selectAll("select * from baro_page3 order by work_dt");
		cur=node.child(0);
		row=2;
		prev=cur.work_dt;
		date=dateFormat(prev)
		e.write(row, 1, e.format(f2), "기준일: ${date}");
		row=4;
		while(cur, node) {
			not( cur.cmp('work_dt',prev)) {
				prev=cur.work_dt;
				date=dateFormat(prev);
				e.merge("A$row:D$row", e.format(f2), "기준일: ${date}");
				row++;
			}
			e.write(row, 1, fmt, cur.cell0);
			e.write(row, 2, fmt, cur.cell1);
			e.write(row, 3, fmt, cur.cell2);
			e.write(row, 4, fmt, cur.cell3);
			row++;
		}		
		
		idx=System.date('MMdd_hhmm');
		fileName="data/excel/baro_${idx}.xlsx";
		e.save(fileName);
		e.close();
		System.run(fileName);
	}
</func>