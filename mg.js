
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
let b = 0, inter, g, maze, creatingMaze = false;

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
	inter = setInterval(()=> {animate(false)}, parseInt(fr.value));
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
		this.searchclr = c.value;
		this.walls = [1,1,1,1];
	}
	draw() {
		vs.box(this.pos, this.l, this.l);
		vs.fill(this.fclr);
	}
	drawSearch() {
		vs.box(this.pos, this.l, this.l);
		vs.fill(this.searchclr);
	}
	drawWalls() {
		ctx.lineCap = 'square';
		if(this.walls[0]) {
			s.line(this.pos.x, this.pos.y, this.pos.x+this.l, this.pos.y); //top
			s.stroke(this.sclr, Math.floor(cs/3));
		}
		if(this.walls[1]) {
			s.line(this.pos.x+this.l, this.pos.y, this.pos.x+this.l, this.pos.y+this.l); //right
			s.stroke(this.sclr, Math.floor(cs/3));
		}
		if(this.walls[2]) {
			s.line(this.pos.x+this.l, this.pos.y+this.l, this.pos.x, this.pos.y+this.l);  //bottom
			s.stroke(this.sclr, Math.floor(cs/3));
		}
		if(this.walls[3]) {
			s.line(this.pos.x, this.pos.y+this.l, this.pos.x, this.pos.y);  //left
			s.stroke(this.sclr, Math.floor(cs/3));
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
	maze = new UGraph(graph.v);
	animateStore.push(root);
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
			//store[curr].removeWalls(chosen);
			graph.AdjList.get(chosen).visited = true;
			maze.add(curr, chosen);
			stk.push(chosen);
			//animateStore.push(chosen);  better storage opt. but won't make wall disappear live
		}
	}
}
let prev = new Array, dist = new Array(), target = 8;
function dijkstra(graph, root) {
	target = graph.v-1;
	let q = new Set();
	const iterator1 = graph.AdjList[Symbol.iterator]();
	
	[...iterator1].forEach(z=> {
		dist[z[0]] = 99999;
		prev[z[0]] = undefined;
		q.add(z[0]);
	});
	dist[root] = 0;
		//console.log(q.values().next().value);
		//let curr = g.list[i];

	while(q.size >= 1) {
		let u = dist.indexOf(Math.min(...dist));
		if (u == target) break;
		if (q.has(u)) {
			q.delete(u);
		}

		let sathi = [...graph.AdjList.get(u).d];
		
		for (var i = 0; i < sathi.length; i++) {
			if(q.has(sathi[i])){
				let alt = dist[u]+1;
				if(alt < dist[sathi[i]]) {
					dist[sathi[i]] = alt;
					prev[sathi[i]] = u;
				}
			}
		}
		dist[u] = 99999999;
	}

	let stk = new Stack();
	let ta = target;

	if (prev[ta] != undefined || ta == root) {
		while(ta != undefined) {
			stk.push(ta);
			ta = prev[ta];
		}
	}
	return stk;
}

function make(callback) {
	creatingMaze = true;
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
				g.add(count, count+(canvas.width/cs));
			}
			count++;
		}
		maxW += canvas.width/cs;
	}
	//g.dfs(0)
	DFS(g, 0);
	if(callback) callback();
}
function search() {
	if(creatingMaze) return 0;

	b= 0;
	animateStore = dijkstra(maze, 0).stackarray;
	inter = setInterval(()=> {animate(true)}, parseInt(fr.value));
}
function animate(search) {
	//s.clear(0,0,canvas.width,canvas.height);
	if(animateStore[b] != undefined && !search) {
		store[animateStore[b]].removeWalls(animateStore[b+1]);
		store[animateStore[b]].draw();
	}else if(animateStore[b] != undefined && search) {
		store[animateStore[b]].drawSearch();
	}else{
		if(creatingMaze) {creatingMaze = false;}
		console.log('stop')
		animateStore.length = 0;
		clearInterval(inter);
	}
	store.forEach(z=>{
		z.drawWalls();
	});
	
	b++;
}
//getDimensions();

