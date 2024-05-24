<func>
	isFunc(&s, check) {
		s.move();
		if(s.ch('(')) {
			s.match();
			not(check) return true;
			if(s.ch('{')) return true;
		}
		return false;
	}
	tagBody(&s, tag) {
		s.findPos("<$tag",0,1);
		not(s.ch('<')) return;
		ss=s.match("<$tag","</$tag>");
		if(typeof(ss,'bool')) return print("태그내용 찾기오류 [$tag에 매칭되는 태그가 없습니다]");
		ss.findPos('>');
		return ss;
	} 
</func>
