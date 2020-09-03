var p = document.querySelector('#p');

var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 400;

let line = new Lines();
let wi = 40;
let rows = canvas.height/wi;
let cols = canvas.width/wi;
let neighbour = new Array();
let grid = new Array();

class Cells {
	constructor(i, j) {
		this.w = wi;//can be skipped
		this.i = i;
		this.j = j;
		this.walls = [true,true,true,true];
		this.visited = false;
	}
	static index(i, j) {
		if (i < 0 || j < 0 || i > cols-1 || j > rows-1) {
			return -1;
		}else {
			return j + i * rows;
		}
	}
	draw() {
		let x = this.i*this.w;
		let y = this.j*this.w;

		if (this.walls[0]) line.draw(x, y, x+this.w, y);
		if (this.walls[1]) line.draw(x+this.w, y, x+this.w, y+this.w);
		if (this.walls[2]) line.draw(x+this.w, y+this.w, x, y+this.w);
		if (this.walls[3]) line.draw(x, y+this.w, x, y);

		
	}
	drawVisit() {
		let x = this.i*this.w;
		let y = this.j*this.w;

		
		if (this.visited) {
			
			ctx.beginPath();
			ctx.fillStyle = 'rgb(100, 9, 100)';
			ctx.fillRect(x, y, this.w, this.w);
			//ctx.strokeRect(x, y, this.w, this.w);
			ctx.closePath();
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
//create grid
(()=>{
	for (var i = 0; i < rows; i++) {
		for (var j = 0; j < cols; j++) {
			grid.push(new Cells(i, j));
		}
	}
})();

//step-1
var current;
grid[0].visited = true;
myStack.push(grid[0]);

function animation() {
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	
	//step - 2,3,4
	if (myStack.stackarray.length) {
		current = myStack.pop();
		if(current.checkNeighbours()) {
			myStack.push(current);
			var next = neighbour[Math.floor(Math.random()*neighbour.length)];
			if (next !== undefined) {
				Cells.removeWalls(current, next);
				next.visited = true;
				myStack.push(next);
			}
		}
	}else {
		console.log('done');
		clearInterval(inter);
	}

	grid.forEach(y=>{
		y.drawVisit();
		y.draw();
	});
	
	neighbour = new Array();
	//clearInterval(inter)
	//requestAnimationFrame(animation);
}
let inter = setInterval(animation, 60);
