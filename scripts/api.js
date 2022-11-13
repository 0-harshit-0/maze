export function validateDimensions(width=0, height=0, cellSize=0) {
	if (!width || !height || !cellSize) return 0;
	
	
	// reset the old stacks/arrays, and start new maze generation
	return createMaze(width, height, cellSize);
}

function createMaze(width=0, height=0, cellSize=0) {
	if (!width || !height || !cellSize) return 0;

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
let prev = new Array, dist = new Array(), target = 8;
export function dijkstra(graph, root) {
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
