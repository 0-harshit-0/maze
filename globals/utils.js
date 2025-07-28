class Stack {
	constructor() {
		this.length = 0;
		this.stackarray = new Array();
	}
	push(value) {

		this.stackarray.unshift(value);
		this.length++;

		return value;
	}
	pop() {
		if (this.length < 0) {
			this.length = 0;
			throw 'Stack is empty';
		}
		this.length--;
		return this.stackarray.shift();
		//return this.stackarray;
	}
	view() {
		return this.stackarray;
	}
}


class Queues {
	constructor() {
		this.length = 0;
		this.queuearray = new Array();
	}
	push(value) {
		
		this.queuearray.push(value);
		this.length++;

		return value;
	}
	pop() {
		if (!this.length) throw 'Queue is empty';
		this.length--;
		
		return this.queuearray.shift();
	}
	view()  {
		return this.queuearray;
	}
}

class Node {
	constructor(data) {
		this.d = data;
		this.next = null;
		this.visited = false;
	}
}

class LinkedList {
	constructor() {
		this.head = null;
		this.length = 0;
	}
	view() {
		// let curr = this.head;
		// while(curr) {
		// 	console.log(curr.d);
		// 	curr = curr.next;
		// }
		return this;
	}
	get(n = 0) { //by index
		let curr = this.head;
		for (var i = 0; i < n; i++) {
			curr = curr.next;
		}
		return curr.d;
	}
	add(element) {
		let current;
		let node  = new Node(element);
		if (this.head == null) {
			this.head = node;
		}else {
			current = this.head;
			while(current.next != null) {
				current = current.next;
			}
			current.next = node;
		}
		this.length++;
		return element;
	}
	insert(element, index=0) {
		if (index < 0 || index > this.length) return 0;

		let node = new Node(element);
		let curr = this.head, prev;
		if (index == 0) {
			node.next = this.head;
			this.head = node;
		}else {
			let i = 0;
			while(i !== index) {
				prev = curr;
				curr = curr.next;
				i++;
			}
			node.next = curr;
			prev.next = node;
		}
		this.length++;
		return element;
	}
	delete(element) {
		let deleted = false, curr = this.head, prev, i=0;
		if (element == this.head.d) {
			deleted = true;
			this.head = this.head.next;
		}else {
			while(curr.next !== null) {
				i++;
				prev = curr;
				curr = curr.next;
				if (curr.d == element) {
					deleted = true;
					prev.next = curr.next;
					break;
				}
			}
		}
		
		if (deleted) {
			this.length--;
			return i;
		}else {
			return deleted;
		}
	}
	remove(index=(this.length-1)) {
		let temp;
		if (index < 0 || index > this.length-1) {
			return false;
		}else {
			let curr = this.head, prev;
			if (index == 0) {
				temp = this.head.d;
				this.head = this.head.next;
			}else {
				let i = 0;
				while(i !== index) {
					prev = curr;
					curr = curr.next;
					i++;
				}
				temp = curr.d;
				prev.next = curr.next;
			}
			this.length--;
			return temp;
		}
	}
}


class GNode {
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
	add(v, dv) { //sv | source vertices
		if(v == dv) return 0;
		if(this.AdjList.has(v)) {
			this.AdjList.get(v).d.add(dv);
		}else{
			if(this.length >= this.v) return 0;
			this.AdjList.set(v, new GNode(dv));
			this.length++;
		}
		if(this.AdjList.has(dv)) {
			this.AdjList.get(dv).d.add(v);
		}else{
			if(this.length >= this.v) return 0;
			this.AdjList.set(dv, new GNode(v));
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
			console.log(item);
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


class Vector2D {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	static add(v1, v2) {
		if (typeof(v2) == "number") {
			var a = v1.x+v2;
			var b = v1.y+v2;
		}else if (typeof(v2) == "object") {
			var a = v1.x+v2.x;
			var b = v1.y+v2.y;
		}

		return new Vector2D(a, b);
	}
	static sub(v1, v2) {
		if (typeof(v2) == "number") {
			var a = v1.x-v2;
			var b = v1.y-v2;
		}else if (typeof(v2) == "object") {
			var a = v1.x-v2.x;
			var b = v1.y-v2.y;
		}

		return new Vector2D(a, b);
	}
	static div(v1, v2) {
		if (typeof(v2) == "number") {
			var a = v1.x/v2;
			var b = v1.y/v2;
		}else if (typeof(v2) == "object") {
			var a = v1.x/v2.x;
			var b = v1.y/v2.y;
		}

		return new Vector2D(a, b);
	}
	static mul(v1, v2) {
		if (typeof(v2) == "number") {
			var a = v1.x*v2;
			var b = v1.y*v2;
		}else if (typeof(v2) == "object") {
			var a = v1.x*v2.x;
			var b = v1.y*v2.y;
		}

		return new Vector2D(a, b);
	}
	static dot(v1, v2) {
		let a = v1.x * v2.x;
		let b = v1.y * v2.y;

		return a + b;
	}
	static magnitude(v) {
		let a = v.x**2;
		let b = v.y**2;

		return Math.sqrt(a + b);
	}
	static angleBetween(v1, v2) {
		let d = Vector2D.dot(v1, v2);
		let mv1 = Vector2D.magnitude(v1);
		let mv2 = Vector2D.magnitude(v2);
		let theta = Math.acos(d/(mv1*mv2));

		return parseInt(theta/(Math.PI/180));
	}
	
	static normalize(v1) { // unit vector
		let mag = Vector2D.magnitude(v1);
		let a, b;
		if (mag) {
			return Vector2D.div(v1, mag);
		}else {
			return new Vector2D();
		}
	}
	static limit(l, v) {
		var mag1 = Vector2D.magnitude(v);
		var w, u = new Vector2D();
		if(mag1 > l) {
			w = Vector2D.normalize(v);
			u = Vector2D.mul(w, l);

			return u;
		}
		return v;
	}
	static setMag(n, v) {
		var normal = Vector2D.normalize(v);

		return Vector2D.mul(normal, n);
	}
	static constrain(n, low, high) { //limits between
		return Math.max(Math.min(n, high), low);
	}
	static map(n, start0, stop0, start1, stop1, within) { // ranges between
		const newval = (n - start0) / (stop0 - start0) * (stop1 - start1) + start1;
		
		if (!within) {
			return newval;
		}
		if (start1 < stop1) {
			return Vector2D.constrain(newval, start1, stop1);
		}else {
			return Vector2D.constrain(newval, stop1, start1);
		}
	}
	static distance(v0, v1) {
		let a = v1.x - v0.x;
		let b = v1.y - v0.y;
		return Math.sqrt((a**2)+(b**2));
	}
}



class ExtraUtiliy {
	constructor() {}
	static downloadFile(name, url) {
		let download = document.createElement('a');

		download.setAttribute("href", url);
		download.setAttribute("download", name);
		download.click();
		download.remove();
	}
}
class CanvasOptions {
	constructor({canvas, context}) {
		this.canvas = canvas;
		this.ctx = context;
		this.path = null;
	}
	
	/* ----------- interactive start ------------ */
	inPath({path, x, y}) {
		path = this.checkPath(path);
		return this.ctx.isPointInPath(path, x ?? y, y ?? x);
	}
	/* ----------- interactive over ------------ */

	checkCanvas(canvas) {
		if(!canvas) {
			return this.canvas;
		}else {
			return canvas;
		}
	}
	checkPath(path) {
		if(path == null || typeof(path) != "object") {
			return this.path;
		}else {
			return path;
		}
	}
	makePath(path) {
		this.path = new Path2D(path);
		return this.path;
	}
	captureStream(framerate = 60) {
		return this.canvas.captureStream(framerate);
	}
	getCanvasData() {
		return this.canvas.toDataURL('image/png', 1.0);
	}
	exportCanvas(canvas) {
		canvas = this.checkCanvas(canvas);
		canvas.toBlob((blob) => {
		  let url = URL.createObjectURL(blob);
		  ExtraUtiliy.downloadFile("export.png", url);
			URL.revokeObjectURL(url);
		}, "image/png", 1.0);
	}
	exportCanvasPart({x, y, width, height}) {
		if (!x || !y || !width || !height) throw "invalid data";

		let tempCanvas = document.createElement("canvas");
		tempCanvas.width = this.canvas.width;
		tempCanvas.height = this.canvas.height;
		let tempCtx = tempCanvas.getContext("2d");

		tempCtx.drawImage(
			this.canvas,
			x, y, width, height,
			x, y, width, height
		);

		this.exportCanvas(tempCanvas);
		tempCanvas.remove();
	}
	exportPath({path, color, scolor, fcolor, width, dash, dashOff, fill, stroke}={}) {
		let tempCanvas = document.createElement("canvas");
		tempCanvas.width = this.canvas.width;
		tempCanvas.height = this.canvas.height;
		let tempShapes = new Shapes({canvas: tempCanvas, context: tempCanvas.getContext("2d")});

		path = this.checkPath(path);
		if(fill & stroke) {
			tempShapes.strokefill({path, scolor, fcolor, width, dash, dashOff});
		}else if (fill) {
			tempShapes.fill({path, color});
		}else if (stroke) {
			tempShapes.stroke({path, color, width, dash, dashOff});
		}

		this.exportCanvas(tempCanvas);
		tempCanvas.remove();
	}
}

class Shapes extends CanvasOptions {
	constructor({canvas, context}={}) {
		super({canvas, context});
	}
	
	fill({path, color}={}, callback) {
		/*
			color :: color to fill with
			path :: the canvas path object
		*/
		path = this.checkPath(path);

		this.ctx.fillStyle = color ?? "black";

		this.ctx.fill(path);
		this.ctx.restore();

		if (typeof(callback) == "function") {
			callback({path, color, fill: true});
		}else{
			return {path, color, fill: true};
		}
	}
	stroke({path, color, width, dash, dashOff}={}, callback) {
		/*
			color :: color to stroke with
			path :: the canvas path object
			width :: width of line
			dash :: dash-space length (array)
			dashOff :: sets the line dash offset, or "phase."
		*/
		path = this.checkPath(path);

		this.ctx.strokeStyle = color ?? "black";
		this.ctx.lineWidth = width ?? 1;
		this.ctx.setLineDash(dash ?? []);
		this.ctx.lineDashOffset = dashOff ?? 0;

		this.ctx.stroke(path);
		this.ctx.restore();

		if (typeof(callback) == "function") {
			callback({path, color, width, dash, dashOff, stroke: true});
		}else{
			return {path, color, width, dash, dashOff, stroke: true};
		}
	}
	strokefill({path, scolor, fcolor, width, dash, dashOff}={}, callback) {
		path = this.checkPath(path);

		this.ctx.strokeStyle = scolor ?? "black";
		this.ctx.fillStyle = fcolor ?? "black";
		this.ctx.lineWidth = width ?? 1;
		this.ctx.setLineDash(dash ?? []);
		this.ctx.lineDashOffset = dashOff ?? 0;

		this.ctx.stroke(path);
		this.ctx.fill(path);
		this.ctx.restore();

		if (typeof(callback) == "function") {
			callback({path, scolor, fcolor, width, dash, dashOff, stroke: true, fill: true});
		}else{
			return {path, scolor, fcolor, width, dash, dashOff, stroke: true, fill: true};
		}
	}
	// --- storke and fill over ---
	line({path, x, y, x1, y1, cap}={}, callback) {
		path = this.makePath(path);

		this.ctx.save();
		this.ctx.lineCap = cap ?? 'butt';

		this.path.moveTo(x ?? 1, y ?? 1);
		this.path.lineTo(x1 ?? 10, y1 ?? 10);

		if (typeof(callback) == "function") {
			callback({path, x, y, x1, y1, cap});
		}else{
			return {path, x, y, x1, y1, cap};
		}
	}
	rect({path, x, y, size, width, height, join}={}, callback) {
		path = this.makePath(path);

		this.ctx.save();
		this.ctx.lineJoin = join ?? 'miter';
		width = width ?? size;
		height = height ?? size;

		this.path.rect(x ?? 1, y ?? 1, width ?? 10, height ?? 10);

		if (typeof(callback) == "function") {
			callback({path, x, y, width, height, join});
		}else{
			return {path, x, y, width, height, join};
		}
	}
	ellipse({path, x, y, radius, xRadius, yRadius, startAngle, endAngle, rotation, clock}={}, callback) {
		path = this.makePath(path);

		this.ctx.save();
		xRadius = xRadius ?? radius;
		yRadius = yRadius ?? radius;

		this.path.ellipse(x ?? 10, y ?? 10, xRadius ?? 1, yRadius ?? 1, rotation ?? 0, startAngle ?? 0, endAngle ?? Math.PI*2, clock ?? false);
		
		if (typeof(callback) == "function") {
			callback({path, x, y, radius, xRadius, yRadius, startAngle, endAngle, rotation, clock});
		}else{
			return {path, x, y, radius, xRadius, yRadius, startAngle, endAngle, rotation, clock};
		}
	}
	polygon({path, x, y, length, faces, rotation, join}={}, callback) {
		path = this.makePath(path);

		this.ctx.save();
		this.ctx.lineJoin = join ?? 'butt';

		// dividing 360 by no. of faces in a shape
		let tempTheta = (Math.floor(360/(faces ?? 5)))*Math.PI/180;
		// calculating the other sides
		let tempLength = length*Math.sin(((180-Math.floor(360/(faces ?? 5)))/2)*Math.PI/180)/Math.sin(tempTheta);
		/*
		move to x, y + length / 2 because the shape created from the center.
		Using tempLength calculated above as distance from center(line of symmetry) as distance from center to vertices.
		https://www.calculator.net/triangle-calculator.html?vc=90&vx=&vy=&va=45&vz=100&vb=45&angleunits=d&x=93&y=18
		*/
		this.path.moveTo((x+length/2) + ((tempLength ?? 20) * Math.cos(tempTheta)), (y+length/2) + ((tempLength ?? 20) * Math.sin(tempTheta)) );
		for (var i = 0; i < (faces ?? 5)+1; i++) {
			// adding rotation here, to rotate shape using angluar velocity
			let theta = tempTheta*(i+1)+rotation;
			this.path.lineTo((x+length/2) + ((tempLength ?? 20) * Math.cos(theta)), (y+length/2) + ((tempLength ?? 20) * Math.sin(theta)) );
		}

		if (typeof(callback) == "function") {
			callback({path, x, y, length, faces, rotation, join});
		}else{
			return {path, x, y, length, faces, rotation, join};
		}
	}
	eqTri({path, x, y, length, rotation}, callback) {
		if (typeof(callback) == "function") {
			this.polygon({path, x: x ?? 10, y: y ?? 10, length: length ?? 10, faces: 3, rotation: rotation ?? 0}, callback);
		}else{
			return this.polygon({path, x: x ?? 10, y: y ?? 10, length: length ?? 10, faces: 3, rotation: rotation ?? 0});
		}
	}
}

//noises=================================================
class Gradient{
	constructor() {
		this.vector2 = new Vector2D();
	}
	
	randomGradient(a, b) {
		let random = 2920 * Math.sin(a * 21942.0 + b * 171324.0 + 8912.0) * Math.cos(a * 23157.0 + b * 217832.0 + 9758.0);
		return this.vector2 = new Vector2D(Math.cos(random), Math.sin(random));
	}
	dotGridGradient(ia, ib, a, b) {
		let gradient = this.randomGradient(ia, ib);

		// Compute the distance vector
		let dx = a - ia;
		let dy = b - ib;
		
		// Compute the dot-product
		return (dx*gradient.x + dy*gradient.y);
	}
	static fade(t) {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}
	static lerp(a0, a1, w) {
		return Gradient.fade(1.0 - w)*a0 + Gradient.fade(w)*a1;
	}
}

function perlin(a, b) {
	let gr = new Gradient();
    // Determine grid cell coordinates
    let x0 = Math.floor(a);
    let x1 = x0 + 1;
    let y0 = Math.floor(b);
    let y1 = y0 + 1;

    // Determine interpolation weights
    // Could also use higher order polynomial/s-curve here
    let sx = a - x0;
    let sy = b - y0;

    // Interpolate between grid point gradients
    let n0, n1, ia0, ia1, value;

    n0 = gr.dotGridGradient(x0, y0, a, b);
    n1 = gr.dotGridGradient(x1, y0, a, b);
    ia0 = Gradient.lerp(n0, n1, sx);

    n0 = gr.dotGridGradient(x0, y1, a, b);
    n1 = gr.dotGridGradient(x1, y1, a, b);
    ia1 = Gradient.lerp(n0, n1, sx);

    value = Gradient.lerp(ia0, ia1, sy);
    return value;
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
