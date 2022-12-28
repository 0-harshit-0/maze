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

import {create, search} from "../packages/index.js";


// get all the input fields from html
const fr = document.querySelector('#fr');  //frame rate
const r = document.querySelector('#r');  //ratio
const lc = document.querySelector('#lc');  //line clr
const c = document.querySelector('#c');  //search clr
let cs = parseInt(document.querySelector('#s').value);  //cell



const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
let timeout = false;

const shp = new Shapes(ctx);
let animateStore = [], store = [];
let asIndex = 0, inter, mazeGraph, creatingMaze = false, scale = 100/100;




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
		shp.rect("", this.pos.x, this.pos.y, this.l);
		shp.fill("", this.fclr);
	}
	drawSearch() {
		shp.rect("", this.pos.x, this.pos.y, this.l);
		shp.fill("", this.searchclr);
	}
	drawWalls() {
		let lineCap = 'square';
		let wallWidth = Math.floor(cs/4);
		if(this.walls[0]) {
			shp.line("", this.pos.x, this.pos.y, this.pos.x+this.l, this.pos.y, lineCap); //top
			shp.stroke("", this.sclr, wallWidth);
		}
		if(this.walls[1]) {
			shp.line("", this.pos.x+this.l, this.pos.y, this.pos.x+this.l, this.pos.y+this.l, lineCap); //right
			shp.stroke("", this.sclr, wallWidth);
		}
		if(this.walls[2]) {
			shp.line("", this.pos.x+this.l, this.pos.y+this.l, this.pos.x, this.pos.y+this.l, lineCap);  //bottom
			shp.stroke("", this.sclr, wallWidth);
		}
		if(this.walls[3]) {
			shp.line("", this.pos.x, this.pos.y+this.l, this.pos.x, this.pos.y, lineCap);  //left
			shp.stroke("", this.sclr, wallWidth);
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
	cs = parseInt(document.querySelector('#s').value);
	if (!cs) return 0;

	// if aspect ratio needs to be maintained then width and height are same else different
	// scaling it to 90% of the container's dimension
	// subtracting the remainder from the width and height, so that the there's no empty space left at the of the container
	let contComputedStyle = getComputedStyle(document.querySelector('.canvas-cont'));
	if(r.checked) {
		let wh = Math.min(parseInt(contComputedStyle.width)*scale, parseInt(contComputedStyle.height)*scale);
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
	const mazeDS = create(canvas.width, canvas.height, cs);
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



// start generation or search animation
function animate(search) {
	//shp.clear(0,0,canvas.width,canvas.height);
	if(animateStore[asIndex] != undefined && !search) {// make the maze (generate maze)
		store[animateStore[asIndex]].removeWalls(animateStore[asIndex+1]);
		store[animateStore[asIndex]].draw();
	}else if(animateStore[asIndex] != undefined && search) { // search the maze
		store[animateStore[asIndex]].drawSearch();
	}else{ // when any of the above process is finished
		if(creatingMaze) {creatingMaze = false;}
		console.log('stop');
		animateStore.length = 0;
		clearInterval(inter);
	}
	asIndex++;

	// draw the updated maze wall (some walls removed/added);
	store.forEach(z=>{
		z.drawWalls();
	});
}



const leftCont = document.querySelector(".left-cont");
const rightCont = document.querySelector(".right-cont");
const gen = document.querySelector('#generate');
const sch = document.querySelector('#search');
const ins = document.querySelector('#install'); // install pwa
const mop = document.querySelector('#more-options'); // download canvas
const dwn = document.querySelector('#download'); // download canvas
const shr = document.querySelector('#share'); // share canvas

gen.addEventListener('click', () => {
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