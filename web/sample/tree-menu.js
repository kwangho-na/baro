## 동적메뉴 출력
<define LeftMenu>
    <li v-if="isFolder" :class="{active:data.open}">
      <a href="#" class="feat-btn" @click="store.toggleMenu(data)">{{data.text}}
        <span class="fas fa-caret-down first"></span>
      </a>
      <ul class="feat-show" :class="{show:data.open}">
        <LeftMenu v-for="cur in data.children" :data="cur" :store="store">
        </LeftMenu>
      </ul>
    </li>
    <li v-else :class="{curMenu:store.currentMenu==data}" @click="store.clickMenu(data)">
    	<a href="#">{{data.text}}</a>
    </li>
    <script computed>
    	isFolder: function() { 
    		return this.data.children && this.data.children.length>0
    	}
    </script>
</define>

<div class="btn" :class="{click:store.leftMenuExtend}">
  <span class="fas fa-bars" 
	@click="store.leftMenuExtend=!store.leftMenuExtend"></span>
</div>

<nav :class="{sidebar:true, show:store.leftMenuExtend}">
  <div class="text">
    Side Menu
  </div>
  <ul class="leftMenu">
    <LeftMenu v-for="cur in store.leftMenus" :data="cur" :store="store">
    	
    </LeftMenu>
  </ul>
</nav>
<div class="content">
  <div class="header">
    Sidebar Menu with sub-menu
  </div>
  <p>
    HTML CSS & Javascript
  </p>
</div>

<script> 
	store.leftMenuExtend=false;
	store.leftMenus=[{"text":"DID 관리","iconCls":"fa fa-display","state":"open", "children":[{"text":"명령어","code":"did001"},{"text":"파일업로드","code":"did002"},{"text":"화면설정","code":"did003"},{"text":"템플릿","code":"did004"},{"text":"박스","code":"did-box"},{"text":"UI","code":"did-ui"},{"text":"tree","code":"did-tree"}]},{"text":"테스트","iconCls":"fa fa-calendar-check","state":"open", "children":[{"text":"fa아이콘","code":"test-faicon"},{"text":"png아이콘","code":"test-vicon"},{"text":"ph아이콘","code":"test-phicon"},{"text":"파일업로드","code":"test-upload"},{"text":"웹소켓테스트","code":"test-websocket"},{"text":"화면테스트","code":"test-dev"},{"text":"콤포넌트테스트","code":"test-component"}]},{"text":"메시지 관리","iconCls":"fa fa-message","state":"", "children":[{"text":"긴급메시지","code":"msg001"},{"text":"알림메시지","code":"msg002"},{"text":"위젯추가","code":"msg003"},{"text":"효과","code":"msg004"}]},{"text":"아이콘관리","iconCls":"fa fa-book-bookmark","state":"", "children":[{"text":"공통아이콘","code":"log001"},{"text":"사용자아이콘","code":"log002"}]},{"text":"관리자기능","iconCls":"fa fa-user-pen","state":"", "children":[{"text":"소스편집","code":"admin001"},{"text":"실행창","code":"admin002"},{"text":"테스트","iconCls":"fa fa-user-pen"}]}];
	store.toggleMenu=function(item) {
		item.open=item.open?false: true;
	}
	store.clickMenu = item => clog(item)
</script> 

<style>
	.leftMenu>ul {
		margin:0;
		padding:0;
	}
	.curMenu {
		background: #555;
	}
	.btn{
  position: absolute;
  top: 15px;
  left: 45px;
  height: 45px;
  width: 45px;
  text-align: center;
  background: #1b1b1b;
  border-radius: 3px;
  cursor: pointer;
  transition: left 0.4s ease;
}
.btn.click {
  left: 260px;
}
.btn span {
  color: white;
  font-size: 28px;
  line-height: 45px;
}
.btn.click span:before{
  content: '\f00d';
}
.sidebar{
  position: absolute;
  width: 250px;
  height: 100%;
  left: -250px;
  background: #1b1b1b;
  transition: left 0.4s ease;
}
.sidebar.show{
  left: 0px;
}
.sidebar .text{
  color: white;
  font-size: 25px;
  font-weight: 600;
  line-height: 65px;
  text-align: center;
  background: #1e1e1e;
  letter-spacing: 1px;
}
nav ul{
  background: #1b1b1b;
  height: 100%;
  width: 100%;
  list-style: none;
}
nav ul li{
  line-height: 60px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
nav ul li:last-child{
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
nav ul li a{
  position: relative;
  color: white;
  text-decoration: none;
  font-size: 18px;
  padding-left: 40px;
  font-weight: 500;
  display: block;
  width: 100%;
  border-left: 3px solid transparent;
}
nav ul li.active a{
  color: cyan;
  background: #1e1e1e;
  border-left-color: cyan;
}
nav ul li a:hover{
  background: #1e1e1e;
}
nav ul ul{
  position: static;
  display: none;
}
nav ul .feat-show.show{
  display: block;
}
nav ul .serv-show.show1{
  display: block;
}
nav ul ul li{
  line-height: 42px;
  border-top: none;
}
nav ul ul li a{
  font-size: 17px;
  color: #e6e6e6;
  padding-left: 80px;
}
nav ul li.active ul li a{
  color: #e6e6e6;
  background: #1b1b1b;
  border-left-color: transparent;
}
nav ul ul li a:hover{
  color: cyan!important;
  background: #1e1e1e!important;
}
nav ul li a span{
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  font-size: 22px;
  transition: transform 0.4s;
}
nav ul li a span.rotate{
  transform: translateY(-50%) rotate(-180deg);
}
.content{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  color: #202020;
  z-index: -1;
  text-align: center;
}
.content .header{
  font-size: 45px;
  font-weight: 600;
}
.content p{
  font-size: 30px;
  font-weight: 500;
}
</style>

</template>


<template note="화살표 툴팁">
<style>

	/* TOP triangle */
	.info-panel {
	  display: block;
	  position: relative;
	  background: #FFFFFF;
	  padding: 15px;
	  border: 1px solid #DDDDDD;
	  margin-top: 20px;
	}
	.info-panel:before, .info-panel:after {
	  content: '';
	  display: block;
	  position: absolute;
	  bottom: 100%;
	  width: 0;
	  height: 0;
	}
	.info-panel:before {
	  left: 19px;
	  border: 11px solid transparent;
	  border-bottom-color: #ddd;
	}
	.info-panel:after {
	  left: 20px;
	  border: 10px solid transparent;
	  border-bottom-color: #fff;
	}
</style>
</template>

