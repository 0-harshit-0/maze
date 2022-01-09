
var fr = document.querySelector('#fr');  //frame rate
var cs = parseInt(document.querySelector('#s').value);  //cell
var r = document.querySelector('#r');  //ratio
var lc = document.querySelector('#lc');  //line clr
var c = document.querySelector('#c');  //search clr
var gen = document.querySelector('#generate');

r.addEventListener('change', ()=> {
	gen.click();
});

var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');
let timeout = false;

let vs = new VecShapes(ctx), s = new Shapes(ctx);
let store = new Array();
let stk = new Stack(), animateStore = [];
let b = 0, inter;

function getDimensions() {
	clearInterval(inter);
	var root = document.querySelector(':root');
	root.style.setProperty('--clr', lc.value);
	b = 0;
	cs = parseInt(document.querySelector('#s').value);  //cell
	let scale = 90;
	if(r.checked) {
		let wh = Math.min(parseInt(getComputedStyle(document.querySelector('.rightCont')).width)*scale/100, parseInt(getComputedStyle(document.querySelector('.rightCont')).height)*95/100);
		if(wh%cs) {
			wh -= wh%cs;
		}
		canvas.width = wh;
		canvas.height = wh;
	}else{
		let w = parseInt(getComputedStyle(document.querySelector('.rightCont')).width)*scale/100;
		let h = parseInt(getComputedStyle(document.querySelector('.rightCont')).height)*scale/100;
		if(w%cs) {
			w -= w%cs;
		}
		if(h%cs) {
			h -= h%cs;
		}
		canvas.width = w;
		canvas.height = h;
	}
	
	stk = new Stack(), animateStore = [];
	store.length = 0;
	make(animate);
	inter = setInterval(animate, parseInt(fr.value));
}

addEventListener('resize', function(e) {//debounce
	clearTimeout(timeout);
	timeout = setTimeout(getDimensions, 500);
});



class Cells{
	constructor(id, x, y, length) {
		this.id = id;
		this.pos = new Vector2D(x, y);
		this.l = length;
		this.sclr = '#302929';
		this.fclr = lc.value;
		this.walls = [1,1,1,1];
	}
	draw() {
		vs.box(this.pos, this.l, this.l);
		vs.fill(this.fclr);
	}
	drawWalls() {
		ctx.lineCap = 'square';
		if(this.walls[0]) {
			s.line(this.pos.x, this.pos.y, this.pos.x+this.l, this.pos.y); //top
			s.stroke(this.sclr, cs/2);
		}
		if(this.walls[1]) {
			s.line(this.pos.x+this.l, this.pos.y, this.pos.x+this.l, this.pos.y+this.l); //right
			s.stroke(this.sclr, cs/2);
		}
		if(this.walls[2]) {
			s.line(this.pos.x+this.l, this.pos.y+this.l, this.pos.x, this.pos.y+this.l);  //bottom
			s.stroke(this.sclr, cs/2);
		}
		if(this.walls[3]) {
			s.line(this.pos.x, this.pos.y+this.l, this.pos.x, this.pos.y);  //left
			s.stroke(this.sclr, cs/2);
		}		
	}
	removeWalls(chose) {
		if(this.id-chose == 1) {
			this.walls[3] = 0;
			store[chose].walls[1] = 0;
		}else if(this.id-chose == -1) {
			this.walls[1] = 0;
			store[chose].walls[3] = 0;
		}else if(this.id-chose > 1) {
			this.walls[0] = 0;
			store[chose].walls[2] = 0;
		}else if(this.id-chose < -1) {
			this.walls[2] = 0;
			store[chose].walls[0] = 0;
		}
	}
}


function visitedNeighbours(graph, c) {
	let nArray = [...graph.neighbors(c)];
	let remains = [];
	for (var i = 0; i < nArray.length; i++) {
		if(!graph.AdjList.get(nArray[i]).visited) {
			remains.push(nArray[i]);
		}
	}
	return remains;
}

function DFS(graph, root) {
	graph.AdjList.get(root).visited = true;
	stk.push(root);
	while(stk.length) {
		let curr = stk.pop();
		//console.log(curr)
		animateStore.push(curr);
		let sathi = [...graph.neighbors(curr)];
		let available = visitedNeighbours(graph, curr);
		if(available.length){
			stk.push(curr);
			let chosen = available[Math.floor(Math.random()*available.length)];
			store[curr].removeWalls(chosen);
			graph.AdjList.get(chosen).visited = true;
			stk.push(chosen);
		}
	}
}

function make(callback) {
	let maxW = canvas.width/cs-1;
	let n = canvas.width/cs*canvas.height/cs;
	g = new UGraph(n);
	let count = 0;
	for(let i = 0; i < canvas.height; i+= cs) {
		for(let j = 0; j < canvas.width; j+= cs) {
			store.push(new Cells(count, j, i, cs, 'black', 'white'));
			if(count+1 <= maxW) {
				g.add(count, count+1);
			}
			if(count+(canvas.width/cs) <= n-1) {
				g.add(count, count+(canvas.height/cs));
			}
			count++;
		}
		maxW += canvas.width/cs;
	}
	//g.dfs(0)
	DFS(g, 0);
	if(callback) callback();
}
function animate() {
	//s.clear(0,0,canvas.width,canvas.height);
	if(animateStore[b] != undefined) {
		store[animateStore[b]].draw();
	}else{
		console.log('stop')
		clearInterval(inter);
	}
	store.forEach(z=>{
		z.drawWalls();
	});
	b++;
	//console.log(b)
}
//getDimensions();


/*
let wi = parseInt(s.value);
let rows = Math.floor(canvas.height/wi);
let cols = Math.floor(canvas.width/wi);
let neighbour = new Array();
let grid = new Array();
let shape = new Shapes(ctx);
var current, inter;

let start, goal;

class Cells {
	constructor(id, i, j, color, fcolor, f) {
		this.pos = new Vector2D(i*wi, j*wi);
		this.id = id;
		this.w = wi;//can be skipped
		this.i = i;
		this.j = j;
		this.walls = [true,true,true,true];
		this.visited = false;
		this.c = color;
		this.fc = fcolor;
		//this.fValue = f;
	}
	static index(i, j) {
		if (i < 0 || j < 0 || i > cols-1 || j > rows-1) {
			return -1;
		}else {
			return Math.floor(j * cols + i);
		}
	}
	draw() {
		let x = Math.floor(this.i*this.w);
		let y = Math.floor(this.j*this.w);

		ctx.lineWidth = 5;
		//ctx.lineCap ='round';
		//ctx.strokeStyle = this.c;
		if (this.walls[0]) {
			shape.line(x, y, x+this.w, y);
			shape.stroke(this.c);
		}
		if (this.walls[1]) {
			shape.line(x+this.w, y, x+this.w, y+this.w);
			shape.stroke(this.c);
		}
		if (this.walls[2]) {
			shape.line(x+this.w, y+this.w, x, y+this.w);
			shape.stroke(this.c);
		}
		if (this.walls[3]) {
			shape.line(x, y+this.w, x, y);
			shape.stroke(this.c);
		}
	}
	drawVisit() {
		let x = Math.floor(this.i*this.w);
		let y = Math.floor(this.j*this.w);

		
		if (this.visited) {
			ctx.lineWidth = 1;
			shape.box(x, y, this.w, this.w);
			shape.fill(this.fc);
		}
	}
	checkNeighbours() {
		let top = grid[Cells.index(this.i, this.j-1)];
		let right = grid[Cells.index(this.i+1, this.j)];
		let bottom = grid[Cells.index(this.i, this.j+1)];
		let left = grid[Cells.index(this.i-1, this.j)];

		if (top !== undefined) {
			if (!top.visited) {
				neighbour.push(top);
			}
		}
		if (right !== undefined) {
			if (!right.visited) {
				neighbour.push(right);
			}
		}
		if (bottom !== undefined) {
			if (!bottom.visited) {
				neighbour.push(bottom);
			}
		}
		if (left !== undefined) {
			if (!left.visited) {
				neighbour.push(left);
			}
		}

		if (neighbour.length) {
			return 1;
		}else {
			return 0;
		}
	}
	static removeWalls(a, b) {
		if (a !== undefined && b !== undefined) {
			let x = a.i - b.i;
			if (x == 1) {
				a.walls[3] = false;
				b.walls[1] = false;
			}else if (x == -1) {
				b.walls[3] = false;
				a.walls[1] = false;
			}
			let y = a.j - b.j;
			if (y == 1) {
				b.walls[2] = false;
				a.walls[0] = false;
			}else if (y == -1) {
				b.walls[0] = false;
				a.walls[2] = false;
			}
		}
	}
}

let myGraph, target, myStack;
//create grid
function create() {
	wi = parseInt(s.value);
	rows = Math.floor(canvas.height/wi);
	cols = Math.floor(canvas.width/wi);
	neighbour.length = 0;
	grid.length = 0;
	myStack = new Stack();

	let count = 0;
	for (var j = 0; j < cols; j++) {
		for (var i = 0; i < rows; i++) {
			grid.push(new Cells(count, i, j, lc.value, c.value, 0));
			count++;
		}
	}

	myGraph = new Graph(grid.length);
	target = grid.length-1;
	//step-1
	grid[0].visited = true;
	myStack.push(grid[0]);
}

let dis = new Array(), prev = new Array();
let q, alt;
function drawBoxes(x) {//reverse the dijkstra algo and find path
	
	let ixter = setInterval((s)=> {
		let u = s.pop();

		if (grid[u] == undefined) {
			clearInterval(ixter);
			return;
		}
		if (u == target) {
			grid[u].fc = 'green';
			console.log('complete');
		}
		grid[u].drawVisit();
		grid[u].draw();
		
	}, 60, x);
}
function dijkstra(root, g) {
	grid[root].drawVisit();
	grid[root].draw();

	q = new Set();
	for (var i = 0; i < g.v; i++) {
		dis.push(9990);
		prev.push(undefined);
		q.add(i);
		
	}
	
	dis[root] = 0;
		//console.log(q.values().next().value);
		//let curr = g.list[i];

	while(q.size >= 1) {
		let u;
		let ver = dis.indexOf(Math.min(...dis));

		if (q.has(ver)) {
			u = ver;
		}

		if (u == target) {
			break;
		}
		q.delete(u);

		//console.log(q.has(1));
		for (var i = 0; i < g.list[u].size; i++) {
			let y = g.list[u].iterate(i);
			q.forEach(v => {
				if (v == y) {
					
					alt = dis[u]+1;


					if (alt < dis[v]) {
						dis[v] = alt;
						prev[v] = u;
					}
				}
			});
		}
		dis[ver] = 10000;
	}

	let s = new Stack();
	let ta = target;

	if (prev[ta] !== undefined || ta == root) {
		while(ta !== undefined) {
			s.push(ta);
			ta = prev[ta];
		}
	}

	drawBoxes(s);
	return s;
}
	shape.box(0, 0, canvas.width, canvas.height);
	shape.fill('#fff')
function animation() {
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	shape.box(0, 0, canvas.width, canvas.height);
	shape.fill('#fff')
	//step - 2,3,4
	if (myStack.stackarray.length) {
		current = myStack.pop();
		if(current.checkNeighbours()) {
			myStack.push(current);
			var next = neighbour[Math.floor(Math.random()*neighbour.length)];
			if (next !== undefined) {
				Cells.removeWalls(current, next);
				myGraph.addEdge(current.id, next.id);
				next.visited = true;
				myStack.push(next);
			}
		}
	}else {
		
		console.log('done');
		clearInterval(inter);
	}

	grid.forEach(y=>{
		//y.drawVisit();
		y.draw();
	});
	
	neighbour.length = 0;

	//clearInterval(inter)
	//requestAnimationFrame(animation);
}

function generationStart() {
	
	clearInterval(inter);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	create();
	inter = setInterval(animation, parseInt(fr.value));
}
function searchStart() {
	dijkstra(0, myGraph);
}
*/