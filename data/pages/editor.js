lineCopy(e) {
  sp=e.pos('lineStart'), ep=e.pos('lineEnd')
  s=e.text(sp,ep)
  e.move(ep)
  e.insert("\r\n$s", true)
  print("s==$s", sp,ep)
}
