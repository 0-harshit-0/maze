import {validateDimensions, search} from "./api.js";


// get all the input fields from html
var fr = document.querySelector('#fr');  //frame rate
var cs = parseInt(document.querySelector('#s').value);  //cell
var r = document.querySelector('#r');  //ratio
var lc = document.querySelector('#lc');  //line clr
var c = document.querySelector('#c');  //search clr



var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');
let timeout = false;

let vs = new VecShapes(ctx), s = new Shapes(ctx);
let animateStore = [], store = [];
let asIndex = 0, inter, mazeGraph, creatingMaze = false, scale = 90/100;




// A Cell in a maze
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



// store all the cells in a graph
function make() {
	creatingMaze = true;
	let count = 0;
	for(let i = 0; i < canvas.height; i+= cs) {
		for(let j = 0; j < canvas.width; j+= cs) {
			store.push(new Cells(count, j, i, cs, 'black', 'white'));
			count++;
		}
	}
}

function generateMaze() {
	// stop the old maze generation in process
	clearInterval(inter);

	// reset the old stacks/arrays, and start new maze generation
	asIndex=0;
	animateStore.length = 0;
	store.length = 0;

	// change the css color variable value to search color input field
	var root = document.querySelector(':root');
	root.style.setProperty('--clr', lc.value);

	// get the the cell size
	cs = parseInt(document.querySelector('#s').value);
	if (!cs) return 0;

	// if aspect ratio needs to be maintained then width and height are same else different
	// scaling it to 90% of the container's dimension
	// subtracting the remainder from the width and height, so that the there's no empty space left at the of the container
	let contComputedStyle = getComputedStyle(document.querySelector('.rightCont'));
	if(r.checked) {
		let wh = Math.min(parseInt(contComputedStyle.width)*scale, parseInt(contComputedStyle.height)*95/100);
		if(wh%cs) {
			wh -= wh%cs;
		}
		canvas.width = wh;
		canvas.height = wh;
	}else{
		let w = parseInt(contComputedStyle.width)*scale;
		let h = parseInt(contComputedStyle.height)*scale;
		if(w%cs) {
			w -= w%cs;
		}
		if(h%cs) {
			h -= h%cs;
		}
		canvas.width = w;
		canvas.height = h;
	}

	make();
	const mazeDS = validateDimensions(canvas.width, canvas.height, cs);
	animateStore = mazeDS.mazeArr;
	mazeGraph = mazeDS.mazeGraph;

	// start creating a maze at a given interval
	inter = setInterval(()=> {
		animate(false)
	}, parseInt(fr.value));
}



function searchMaze() {
	if(creatingMaze) return 0;

	animateStore = search(mazeGraph, 0).stackarray, asIndex=0;
	inter = setInterval(()=> {
		animate(true)
	}, parseInt(fr.value));
}



// start generation or search animation
function animate(search) {
	//s.clear(0,0,canvas.width,canvas.height);
	if(animateStore[asIndex] != undefined && !search) {// make the maze (generate maze)
		store[animateStore[asIndex]].removeWalls(animateStore[asIndex+1]);
		store[animateStore[asIndex]].draw();
	}else if(animateStore[asIndex] != undefined && search) { // search the maze
		store[animateStore[asIndex]].drawSearch();
	}else{ // when any of the above process is finished
		if(creatingMaze) {creatingMaze = false;}
		console.log('stop')
		animateStore.length = 0;
		clearInterval(inter);
	}
	asIndex++;

	// draw the updated maze wall (some walls removed/added);
	store.forEach(z=>{
		z.drawWalls();
	});
}




var gen = document.querySelector('#generate');
var sch = document.querySelector('#search');

gen.addEventListener('click', () => {
	generateMaze();
});
sch.addEventListener('click', () => {
	searchMaze();
});