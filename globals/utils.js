class Stack {
	constructor() {
		this.stackarray = new Array();
		this.length = this.stackarray.length;
	}
	push(value) {
		this.stackarray.unshift(value);
		this.length = this.stackarray.length;
		return value;
	}
	pop() {
		if (this.length <= 0) {
			throw 'Stack is empty';
		}
		const poped = this.stackarray.shift();
		this.length = this.stackarray.length;
		return poped;
	}
	view() {
		return this.stackarray;
	}
}
class Queues {
	constructor() {
		this.queuearray = new Array();
		this.length = this.queuearray.length;
	}
	push(value) {
		this.queuearray.push(value);
		this.length = this.queuearray.length;

		return value;
	}
	pop() {
		if (!this.length) throw 'Queue is empty';
		
		const poped = this.queuearray.shift();
		this.length = this.queuearray.length;
		return poped;
	}
	view()  {
		return this.queuearray;
	}
}
class Node {
	constructor(data) {
		this.d = new Set().add(data);
		this.visited = false;
	}
}
class UGraph {
	constructor(vertices) {
		this.v = vertices;
		this.AdjList = new Map();
		this.length = 0;
	}
	add(v, dv) { //dv | destination vertices
		if(v == dv) return 0;
		if(this.AdjList.has(v)) {
			this.AdjList.get(v).d.add(dv);
		}else{
			if(this.length >= this.v) return 0;
			this.AdjList.set(v, new Node(dv));
			this.length++;
		}
		if(this.AdjList.has(dv)) {
			this.AdjList.get(dv).d.add(v);
		}else{
			if(this.length >= this.v) return 0;
			this.AdjList.set(dv, new Node(v));
			this.length++;
		}
	}
	adjacent(v1, v2) {
		return this.AdjList.get(v1).d.has(v2);
	}
	neighbors(v1) {
		return this.AdjList.get(v1).d;
	}
	remove(v, dv=false) {
		if(!dv) {
			this.AdjList.delete(v);
		}else{
			this.AdjList.get(v).d.delete(dv);
		}
	}
	view() {
		const iterator1 = this.AdjList[Symbol.iterator]();

		for (const item of iterator1) {
			console.log(item[0]);
			console.log(item[1].d);
		}
	}
	//travers
	dfs(root) {
		console.log(root)
		//console.log(this.AdjList.get(root))
		this.AdjList.get(root).visited = true;
		[...this.neighbors(root)].forEach(z=> {
			if(!this.AdjList.get(z).visited){
				this.dfs(z);
			}
		});
	}
	dfsS(root) {
		let s = new Stack();
		s.push(root);
		while(s.length) {
			root = s.pop();
			if(!this.AdjList.get(root).visited) {
				console.log(root)
				this.AdjList.get(root).visited = true;
				[...this.neighbors(root)].forEach(z=> {
					s.push(z);
				});
			}
		}
	}
	bfs(root) {
		let q = new Queues();
		this.AdjList.get(root).visited = true;
		q.push(root);

		while(q.length) {
			let v = q.pop();
			console.log(v);
			//if (v == root) {}
			[...this.neighbors(v)].forEach(z=> {
				if(!this.AdjList.get(z).visited){
					
					this.AdjList.get(z).visited = true;
					q.push(z);
				}
			});
		}
	}
}



// maze create start
function create(width=3, height=3, cellSize=1) {
	if (!width || !height || !cellSize) throw new Error("please make sure that (width || height || cellSize) is not (null || undefined || 0)");
	let w = width, h = height, cs = cellSize;

	if(w%cs) {
		throw new Error("please make sure that (width % cellSize == 0)");
	}
	if(h%cs) {
		throw new Error("please make sure that (height % cellSize == 0)");
	}
	
	// reset the old stacks/arrays, and start new maze generation
	return createMaze(width, height, cellSize);
}
function createMaze(width, height, cellSize) {
	let maxW = width/cellSize-1;
	let n = width/cellSize*height/cellSize;
	const graph = new UGraph(n);
	let count = 0;
	for(let i = 0; i < height; i+= cellSize) {
		for(let j = 0; j < width; j+= cellSize) {
			if(count+1 <= maxW) {
				graph.add(count, count+1);
			}
			if(count+(width/cellSize) <= n-1) {
				graph.add(count, count+(width/cellSize));
			}
			count++;
		}
		maxW += width/cellSize;
	}

	return DFS(graph, 0);
}
// return the neighbours which are not visited yet
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
// use DFS to traverse the graph(maze) and return the traversed nodes(cells/numbers) 
function DFS(graph, root) {
	const stk = new Stack();
	const mazeArr = [];
	const mazeGraph = new UGraph(graph.v);

	graph.AdjList.get(root).visited = true;
	stk.push(root);
	while(stk.length) {
		let curr = stk.pop();
		mazeArr.push(curr); // stores backtracked node/number/cells as well

		let available = visitedNeighbours(graph, curr);
		if(available.length){
			stk.push(curr);
			let chosen = available[Math.floor(Math.random()*available.length)];
			graph.AdjList.get(chosen).visited = true;
			mazeGraph.add(curr, chosen);
			stk.push(chosen);
			//animateStore.push(chosen); // issue with removing walls
		}
	}
	return {mazeArr, mazeGraph};
}

// search algorithm: dijkstra
// target is always the last cell/node in the graph
function search(graph, root, target, searchAlgoId=1) {
	if(!graph) throw new Error("graph is undefined");
	if ([undefined, null].includes(root), [undefined, null].includes(target)) {
		throw new Error("(root || target) is (null || undefined)")
	}

	if(searchAlgoId === 1) {
		return dijkstra(graph, root, target);
	}else {
		throw new Error("no search search algorithm with id "+searchAlgoId)
	}
}
function dijkstra(graph, root, target) {
	let prev = new Array(), dist = new Array();

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
