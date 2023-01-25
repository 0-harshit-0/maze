import {create, search} from "../packages/index.js";


const leftCont = document.querySelector(".left-cont");
const rightCont = document.querySelector(".right-cont");
const gen = document.querySelector('#generate');
const sch = document.querySelector('#search');
const ins = document.querySelector('#install'); // install pwa
const mop = document.querySelector('#more-options'); // download canvas
const dwn = document.querySelector('#download'); // download canvas
const shr = document.querySelector('#share'); // share canvas

// get all the input fields from html
const fr = document.querySelector('#fr');  //frame rate
const r = document.querySelector('#r');  //ratio
const lc = document.querySelector('#lc');  //line clr
const c = document.querySelector('#c');  //search clr
const cs = document.querySelector('#s');  //cell

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

const relatedApps = await navigator.getInstalledRelatedApps();
const PWAisInstalled = relatedApps.length > 0;
// pwa over


// canvas stuff starts here
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
let timeout = false;

const shape = new Shapes({canvas, context: ctx});
let asIndex = 0, inter, mazeGraph, creatingMaze = false, scale = 100/100;
let animateStore = [], store = [];

// A Cell in a maze
class Cells {
	constructor(id, x, y, length) {
		this.id = id;
		this.pos = new Vector2D(x, y);
		this.l = length;

		this.wallClr = '#302929';
		this.cellClr = lc.value;
		
		this.walls = [1,1,1,1];
		this.path = null;
		this.interacted = false;
	}
	draw(clr) {
		if (!this.path) {
			this.path = shape.rect({x: this.pos.x, y: this.pos.y, size: this.l}).path;
		}
		shape.fill({path: this.path, color: clr ?? this.cellClr});
	}
	drawSearch(clr) {
		shape.rect({x: this.pos.x, y: this.pos.y, size: this.l});
		shape.fill({color: clr});
	}
	drawWalls() {
		let lineCap = 'square';
		let wallWidth = Math.floor(this.l/4);
		let paths = [];
		if(this.walls[0]) {
			paths.push(shape.line({x: this.pos.x, y: this.pos.y, x1: this.pos.x+this.l, y1: this.pos.y, cap: lineCap})); //top
		}
		if(this.walls[1]) {
			paths.push(shape.line({x: this.pos.x+this.l, y: this.pos.y, x1: this.pos.x+this.l, y1: this.pos.y+this.l, cap: lineCap})); //right
		}
		if(this.walls[2]) {
			paths.push(shape.line({x: this.pos.x+this.l, y: this.pos.y+this.l, x1: this.pos.x, y1: this.pos.y+this.l, cap: lineCap}));  //bottom
		}
		if(this.walls[3]) {
			paths.push(shape.line({x: this.pos.x, y: this.pos.y+this.l, x1: this.pos.x, y1: this.pos.y, cap: lineCap}));  //left
		}
		paths.forEach(z => {
			shape.stroke({path: z.path, color: this.wallClr, width: wallWidth});
		});
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
	interactive(x, y) {
		if (shape.inPath({path: this.path, x, y})) {
			if (!this.interacted) {
				this.interacted = true;
				this.drawSearch(c.value);
			}else {
				this.interacted = false;
				this.draw();
			}

			shape
		}
	}
}

// store all the cells in a graph
function make() {
	creatingMaze = true;
	let count = 0;
	for(let i = 0; i < canvas.height; i += parseInt(cs.value)) {
		for(let j = 0; j < canvas.width; j += parseInt(cs.value)) {
			store.push(new Cells(count, j, i, parseInt(cs.value)));
			count++;
		}
	}
	store[0].walls[3] = 0;
	store[store.length-1].walls[1] = 0;
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
	if (!parseInt(cs.value)) return 0;

	// if aspect ratio needs to be maintained then width and height are same else different
	// scaling it to 90% of the container's dimension
	// subtracting the remainder from the width and height, so that the there's no empty space left at the of the container
	let contComputedStyle = getComputedStyle(document.querySelector('.canvas-cont'));
	if(r.checked) {
		let wh = Math.min(parseInt(contComputedStyle.width)*scale, parseInt(contComputedStyle.height)*scale);
		if(wh % parseInt(cs.value)) {
			wh -= wh % parseInt(cs.value);
		}
		canvas.width = wh;
		canvas.height = wh;
	}else{
		let w = parseInt(contComputedStyle.width)*scale;
		let h = parseInt(contComputedStyle.height)*scale;
		if(w % parseInt(cs.value)) {
			w -= w % parseInt(cs.value);
		}
		if(h % parseInt(cs.value)) {
			h -= h % parseInt(cs.value);
		}
		canvas.width = w;
		canvas.height = h;
	}

	make();
	const mazeDS = create(canvas.width, canvas.height, parseInt(cs.value));
	animateStore = [...mazeDS.mazeArr];
	mazeGraph = mazeDS.mazeGraph;

	// start creating a maze at a given interval
	inter = setInterval(()=> {
		animate(false)
	}, parseInt(fr.value));
}

function searchMaze() {
	if(creatingMaze || !mazeGraph) return 0;
	creatingMaze = true;

	animateStore = search(mazeGraph, 0, mazeGraph.v-1).stackarray, asIndex=0;
	inter = setInterval(()=> {
		animate(true)
	}, parseInt(fr.value));
}

function drawAllWalls() {
	store.forEach(z=>{
		z.drawWalls();
	});
}
// start generation or search animation
function animate(search) {
	//shape.clear(0,0,canvas.width,canvas.height);
	if(animateStore[asIndex] != undefined && !search) {// make the maze (generate maze)
		store[animateStore[asIndex]].removeWalls(animateStore[asIndex+1]);
		store[animateStore[asIndex]].draw();
	}else if(animateStore[asIndex] != undefined && search) { // search the maze
		store[animateStore[asIndex]].drawSearch("#0f0");
		store[animateStore[asIndex]].interacted = true;
	}else{ // when any of the above process is finished
		if(creatingMaze) {creatingMaze = false;}
		console.log('stop');
		animateStore.length = 0;
		clearInterval(inter);
	}
	asIndex++;

	// draw the updated maze wall (some walls removed/added);
	drawAllWalls();
}

canvas.addEventListener('mousedown', e => {
	if (!store.length) return 1;

	for(let i = 0; i < store.length; i++) {
		let z = store[i];
		z.interactive(e.offsetX, e.offsetY);
	}
	drawAllWalls();
});


// dom related stuff.. button listeners, functions calls, etc.
gen.addEventListener('click', () => {
	canvas.style.border = "solid " + (parseInt(cs.value)/10)+"px " + "#302929";
	generateMaze();
});
sch.addEventListener('click', () => {
	searchMaze();
});

// if not installed, show install button
if (deferredPrompt) {ins.style.display = "initial";}
ins.addEventListener('click', async () => {
	const {outcome} = await deferredPrompt.prompt();
	if (outcome != "dismissed") {
		ins.remove();
	}
});

// more options
let open = false;
mop.addEventListener("click", (e) => {
	let display = null;
	!open ? display = "grid" : display = "none";
	leftCont.style.display = display;

	setTimeout(()=> {
		open = true;
	}, 100);
});
rightCont.addEventListener("click", (e) => {
	if(open) {
		leftCont.style.display = "none";
		setTimeout(()=> {
			open = false;
		}, 100);
	}
});

// donwload maze in png format
dwn.addEventListener('click', () => {
	var link = document.createElement('a');
	link.download = 'maze.png';
	link.href = canvas.toDataURL();
	link.click();
	link.remove();
});
// share maze image
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