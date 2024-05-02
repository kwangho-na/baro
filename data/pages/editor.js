lineCopy(e) {
  sp=e.pos('lineStart'), ep=e.pos('lineEnd')
  s=e.text(sp,ep)
  e.move(ep)
  e.insert("\r\n$s", true)
}

insertIndent(e, &str, indent, pos ) {
  if( pos ) this.move(pos);
  not( indent ) {
    line=this.sp('lineStart').spText();
    indent=indentText(line);
  }
  this.insert( rst, true);
  return true;
}

str.indenText(&s, indent) {
  ss='';
  not(indent) indent='';
  not(lineCheck(s) ) s.findPos("\n")
  while( s.valid(), num ) {
    left=s.findPos("\n").trim();
    not(left) continue;
    if(num) ss.add("\n", indent);
    ss.add(left);
  }
  return ss
}
