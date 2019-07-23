var sw=20,//一个方块的宽
    sh=20,//一个方块的高
	tr=30,//行数
	td=30;//列数
	
var snake=null,
	food=null,
	game=null;
	
function Square(x,y,classname){
	this.x=x*sw;
	this.y=y*sh;
	this.class=classname;
	
	this.viewContent=document.createElement('div');//方块对应的DOM元素
	this.viewContent.className=this.class;
	this.parent=document.getElementById('snakeWrap');//方块的父级
}

Square.prototype.create=function(){//创建dom元素，并添加到页面里
	this.viewContent.style.position='absolute';
	this.viewContent.style.width=sw+'px';
	this.viewContent.style.height=sh+'px';
	this.viewContent.style.left=this.x+'px';
	this.viewContent.style.top=this.y+'px';//!!!!!!!!!!!!!
	
	this.parent.appendChild(this.viewContent);//把DOM元素添加到页面里
};
Square.prototype.remove=function(){//删除dom元素
	this.parent.removeChild(this.viewContent);
};

//蛇
function Snake(){
	this.head=null;//存储蛇头的信息
	this.tail=null;//蛇尾的信息
	this.pos=[];//存储蛇身上的每一个方块的位置
	//存储蛇走的方向，用一个对象来表示
	this.directionNum={
		left:{
			x:-1,
			y:0
		},
		right:{
			x:1,
			y:0
		},
		up:{
			x:0,
			y:-1
		},
		down:{
			x:0,
			y:1
		}
		
	}
}
Snake.prototype.init=function(){
	//创建蛇头
	var snakeHead=new Square(2,0,'snakeHead');
	snakeHead.create();
	this.head=snakeHead;         //存储蛇头信息
	this.pos.push([2,0]);   //把蛇头的位置存起来
	
	//创建蛇身体1
	var snakeBody1=new Square(1,0,'snakeBody');
	snakeBody1.create();
	this.pos.push([1,0]);
	//创建蛇身体2
	var snakeBody2=new Square(0,0,'snakeBody');
	snakeBody2.create();
	this.tail=snakeBody2;
	this.pos.push([0,0]);
	
	//形成链表关系
	snakeHead.last=null;
	snakeHead.next=snakeBody1;
	
	snakeBody1.last=snakeHead;
	snakeBody1.next=snakeBody2;
	
	snakeBody2.last=snakeBody1;
	snakeBody2.next=null;
	
	//给蛇添加一条属性，，用来表示蛇走的方向
	this.direction=this.directionNum.right;//默认向右走
}

//这个方法用来获取蛇头下一个位置对应的元素，根据元素做不同的事情
Snake.prototype.getNextPos=function(){
	var nextPos=[
		this.head.x/sw+this.direction.x,
		this.head.y/sh+this.direction.y
	]
	//下个点是自己，表示撞到了自己
	var selfCollied=false;
	this.pos.forEach(function(value){
		if(value[0]==nextPos[0] && value[1]==nextPos[1]){
			selfCollied=true;
		}
	});
	if(selfCollied){
		console.log("撞到自己了");
		this.strategies.die.call(this);
		return;
	}
	
	//下一个点是围墙
	if(nextPos[0]<0||nextPos[1]<0||nextPos[0]>td-1||nextPos[1]>tr-1){
		console.log("撞到墙了");
		this.strategies.die.call(this);
		return;
	}
	//下一个点是食物   吃
	if(food && food.pos[0]==nextPos[0] && food.pos[1]==nextPos[1]){
		this.strategies.eat.call(this);
		return;
	}
	//下一个点什么都没有  继续走
	this.strategies.move.call(this);
};


//处理碰撞后要做的事
Snake.prototype.strategies={
	move:function(format){//这个参数决定要不要删除最后一个body
		//创建新身体（在旧蛇头的位置）
		var newBody=new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
		//更新链表的关系
		newBody.next=this.head.next;
		newBody.next.last=newBody;
		newBody.last=null;
		
		this.head.remove();//把旧蛇头从原来的位置删去
		newBody.create();
		
		//创建一个新蛇头（蛇头下一个位置要走的点）
		var newHead=new Square(this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y,'snakeHead');
		
		newHead.next=newBody;
		newHead.last=null;
		newBody.last=newHead;
		newHead.create();
		//蛇身上的每一个坐标需要更新
		this.pos.splice(0,0,[this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y])
		this.head=newHead;//把this.head更新
		
		
		if(!format){
			//
			this.tail.remove();
			this.tail=this.tail.last;
			this.pos.pop();
		}
	},
	eat:function(){
		this.strategies.move.call(this,true);
		createFood();
		game.score++;
	},
	die:function(){
		game.over();
	}
}



snake=new Snake();


//创建食物
function createFood(){
	var x=null;
	var y=null;
	var include=true; //循环跳出的条件
	while(include){
		x=Math.round(Math.random()*29);
		y=Math.round(Math.random()*29);
		
		snake.pos.forEach(function(value){
			if(x!=value[0]&&y!=value[1]){
				include=false;
			}
		});
	}
	food=new Square(x,y,'food');
	food.pos=[x,y];
	var foodDom=document.querySelector('.food');
	if(foodDom){
		foodDom.style.left=x*sw+'px';
		foodDom.style.top=y*sh+'px';
	}else{
		food.create();
	}
	
	
}


//创建游戏逻辑
function Game(){
	this.timer=null;
	this.score=0;
}
Game.prototype.init=function(){
	 snake.init();
	 //snake.getNextPos();
	 createFood();
	 document.onkeydown=function(ev){
		 if(ev.which==37&&snake.direction!=snake.directionNum.right){
			 snake.direction=snake.directionNum.left; 
		 }else if(ev.which==38&&snake.direction!=snake.directionNum.down){
			 snake.direction=snake.directionNum.up;
		 }else if(ev.which==39&&snake.direction!=snake.directionNum.left){
			 snake.direction=snake.directionNum.right;
	 }else if(ev.which==40&&snake.direction!=snake.directionNum.up){
			 snake.direction=snake.directionNum.down;
		 }
	}
	this.start();
}
Game.prototype.start=function(){
	this.timer=setInterval(function(){
		snake.getNextPos();
	},200);
}


Game.prototype.over=function(){
	clearInterval(this.timer);
	alert('你得分为：'+this.score);
	//游戏结束时回到最初转台
	var snakeWrap=document.getElementById('snakeWrap');
	snakeWrap.innerHTML='';
	snake=new Snake();
	game=new Game();
	var startBtnWrap=document.querySelector('.startBtn');
	startBtnWrap.style.display='block';
}
game=new Game();
var startBtn=document.querySelector('.startBtn button');
	startBtn.onclick=function(){
		startBtn.parentNode.style.display='none';
		game.init();
	};
	
