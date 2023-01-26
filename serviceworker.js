console.log("registered")

self.addEventListener('fetch', function(event) {
	const url = new URL(event.request.url);
	if (event.request.method === 'POST' && url.pathname === '/maze/receive-share') {
        // redirect the user to main page and process the recieved files
		event.respondWith(Response.redirect('/maze/index.html'));

        event.waitUntil(async function () {
            // get the client obj to post message later
            const client = await self.clients.get(event.resultingClientId);
            // get the data from the recieved request
            const data = await event.request.formData();
            // get all the files from recieved data
            let files = [];
            data.forEach(z=> {
                files.push(z);
            });
            // send all the files via postmessage to the application
            client.postMessage({ files });
        }());
        return;
	}else {
        event.respondWith(
            (async ()=> {
                try {
                    // Always try the network first.
                    const networkResponse = await fetch(event.request);
                    return networkResponse;
                } catch (error) {
                    console.log("Fetch failed; returning offline page instead.", error);

                    // open the cache storage
                    const cache = await caches.open("maze-pwa");
                    // for each resource requested, serve them response from cache. (for html send html, for js send js, etc)
                    const cachedResponse = await cache.match(event.request, {ignoreVary:true});
                    //console.log(cache, cachedResponse, event.request)
                    // return the response
                    return cachedResponse;
                }
            })()
        );
    }

});

// caching all the resources on install
const urlsToCache = ["/maze/", "/maze/styles/mstyle.css", "/maze/styles/mg.css", "/maze/scripts/script.js", "/maze/packages/index.js",
    "https://cdn.jsdelivr.net/gh/0-harshit-0/Utility-HTML5Canvas@master/src/shapes.min.js",
    "https://cdn.jsdelivr.net/gh/0-harshit-0/Utility-HTML5Canvas@master/src/vector.min.js",
    "/maze/assets/SometypeMono-Regular.woff2", "/maze/assets/maze-16.png", "/maze/assets/maze-512.png", "/maze/manifest.json"];
self.addEventListener("install", (event) => {
    console.log("caching");
    event.waitUntil(
        caches.open("maze-pwa").then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});