// pwa things
if ('serviceWorker' in navigator) {
   navigator.serviceWorker.register("serviceworker.js");
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
   deferredPrompt = e;

   // show install button if install prompt is present
   if (ins) {ins.style.display = "initial";}
});

navigator.serviceWorker.addEventListener('message', function (e) {
   console.log(e.data.files[0]); //contains the file(s)
});

// pwa over

import {create, search} from "../packages/index.js";


// get all the input fields from html
const fr = document.querySelector('#fr');  //frame rate
const r = document.querySelector('#r');  //ratio
const lc = document.querySelector('#lc');  //line clr
const c = document.querySelector('#c');  //search clr
const cs = document.querySelector('#cs');  //cellsize
const sp = document.querySelector('#sp');  //shape



const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const shape = new Shapes(ctx);

let animateStore = [], store = [];
let asIndex = 0, inter, mazeGraph, creatingMaze = false, scale = 100/100;




// A Cell in a maze
class Cells{
	constructor(id, x, y, length) {
		this.id = id;
		this.pos = new Vector2D(x, y);
		this.l = length;
		this.theta = (180/parseInt(sp.value))*Math.PI/180;
		this.wclr = '#302929';
		this.fclr = lc.value;
		this.searchclr = c.value;
		this.walls = [];
		for (let i=0; i < parseInt(sp.value); i++) {
			this.walls.push(1);
		}
		this.wallWidth =  Math.floor(parseInt(cs.value)/5);
	}
	draw() {
		shape.polygon("", this.pos.x+this.l/2, this.pos.y+this.l/2, (this.l*17/20)/*-(this.wallWidth)*/, parseInt(sp.value), this.theta);
		shape.fill("", this.fclr);
	}
	drawSearch() {
		shape.polygon("", this.pos.x+this.l/2, this.pos.y+this.l/2, this.l*17/20, parseInt(sp.value), this.theta);
		shape.fill("", this.searchclr);
	}
	drawWalls() {
		let lineCap = 'square';
		/*let deg = 0*Math.PI/180;
		
		for (let i = 0; i < this.walls.length; i++) {
			let z = this.walls[i];
			if (z) {
				shape.line("", ((this.l)*Math.cos(deg)) + this.pos.x, ((this.l)*Math.sin(deg)) + this.pos.y, this.pos.x++this.l, this.pos.y+((this.l)*Math.sin(deg)), 0, lineCap);
				shape.stroke("", this.wclr, this.wallWidth);
			}
		}*/
		if(this.walls[0]) {
			shape.line("", this.pos.x, this.pos.y, this.pos.x+this.l, this.pos.y, lineCap); //top
			shape.stroke("", this.sclr, wallWidth);
		}
		if(this.walls[1]) {
			shape.line("", this.pos.x+this.l, this.pos.y, this.pos.x+this.l, this.pos.y+this.l, lineCap); //right
			shape.stroke("", this.sclr, wallWidth);
		}
		if(this.walls[2]) {
			shape.line("", this.pos.x+this.l, this.pos.y+this.l, this.pos.x, this.pos.y+this.l, lineCap);  //bottom
			shape.stroke("", this.sclr, wallWidth);
		}
		if(this.walls[3]) {
			shape.line("", this.pos.x, this.pos.y+this.l, this.pos.x, this.pos.y, lineCap);  //left
			shape.stroke("", this.sclr, wallWidth);
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
	let tcs = parseInt(cs.value), count=0;
	creatingMaze = true;
	for(let i = 0; i < canvas.height; i+= tcs) {
		for(let j = 0; j < canvas.width; j+= tcs) {
			store.push(new Cells(count, j, i, tcs, 'black', 'white'));
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

	// change the css color constiable value to search color input field
	const root = document.querySelector(':root');
	root.style.setProperty('--clr', lc.value);

	// get the the cell size
	let tcs = parseInt(cs.value);
	if (!tcs) return 0;

	// if aspect ratio needs to be maintained then width and height are same else different
	// scaling it to 90% of the container's dimension
	// subtracting the remainder from the width and height, so that the there's no empty space left at the of the container
	let contComputedStyle = getComputedStyle(document.querySelector('.canvasCont'));
	if(r.checked) {
		let wh = Math.min(parseInt(contComputedStyle.width)*scale, parseInt(contComputedStyle.height)*scale);
		if(wh%tcs) {
			wh -= wh%tcs;
		}
		canvas.width = wh;
		canvas.height = wh;
	}else{
		let w = parseInt(contComputedStyle.width)*scale;
		let h = parseInt(contComputedStyle.height)*scale;
		if(w%tcs) {
			w -= w%tcs;
		}
		if(h%tcs) {
			h -= h%tcs;
		}
		canvas.width = w;
		canvas.height = h;
	}

	make();
	const mazeDS = create(canvas.width, canvas.height, tcs);
	animateStore = [...mazeDS.mazeArr];
	mazeGraph = mazeDS.mazeGraph;

	// start creating a maze at a given interval
	inter = setInterval(()=> {
		animate(false)
	}, parseInt(fr.value));
}



function searchMaze() {
	if(creatingMaze) return 0;

	animateStore = search(mazeGraph, 0, mazeGraph.v-1).stackarray, asIndex=0;
	inter = setInterval(()=> {
		animate(true)
	}, parseInt(fr.value));
}



// start generation or search animation
function animate(search) {
	//shape.clear(0,0,canvas.width,canvas.height);
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




const gen = document.querySelector('#generate');
const sch = document.querySelector('#search');
const ins = document.querySelector('#install'); // install pwa
const dwn = document.querySelector('#download'); // download canvas
const shr = document.querySelector('#share'); // share canvas

gen.addEventListener('click', () => {
	generateMaze();
});
sch.addEventListener('click', () => {
	searchMaze();
});

if (deferredPrompt) {ins.style.display = "initial";}
ins.addEventListener('click', () => {
	deferredPrompt.prompt();
});

dwn.addEventListener('click', () => {
	var link = document.createElement('a');
	link.download = 'maze.png';
	link.href = canvas.toDataURL();
	link.click();
	link.remove();
});
shr.addEventListener('click', (e) => {
	let filesArray;
	canvas.toBlob(async blob => {
		filesArray = [new File([blob], "maze.png", {type: "image/png"})];
		
		if (navigator.canShare({files: filesArray})) {
			try {
				await navigator.share({
					files: filesArray,
					title: 'maze',
					text: 'maze'
				})
				console.log('Shared!');
			} catch (error) {
				alert(`Error: ${error.message}`);
			}
		} else {
			alert(`Your system doesn't support sharing these file.`);
		}
	});
});