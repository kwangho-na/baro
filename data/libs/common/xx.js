
w.call('https://www.sexy-models.net/', @proc.web)
xx=Baro.worker('test')
xx.start(@proc.sexyModel, true, 250)

~~
<func>
	@proc.sexyModel() {
		src=logClass('web').timeout()
		if(src) parse(src)
		parse=func(&s) {
			s.findPos('<!-- content -->')
			s.findPos('<div',0,1);
			ss=s.match('<div','</div>');
			ss.findPos('>')
			while(ss.valid()) {
				ss.findPos('<div',0,1);
				post=ss.match('<div','</div>');
				post.findPos('<a href=')
				a=post.match();
				post.findPos('title=')
				title=post.match();
				post.findPos('<img src=')
				src=post.match();
				post.findPos('<a rel="nofollow"')
				post.findPos('>')
				follow=post.findPos('</a>')
				post.findPos('<p class="post-time">')
				time=post.findPos('&').trim()
				post.findPos('<a href=')
				link=post.match();
				root.addNode().with( a, title, src, follow, time, link)
			}
		}
	}
</func>

