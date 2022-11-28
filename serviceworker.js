console.log("registered")

self.addEventListener('fetch', function(event) {
	const url = new URL(event.request.url);
	if (event.request.method === 'POST' && url.pathname === '/receive-share') {
		event.respondWith(Response.redirect('/maze/index.html'));

        event.waitUntil(async function () {
            const client = await self.clients.get(event.resultingClientId);
            const data = await event.request.formData();
            let files = [];
            data.forEach(z=> {
                files.push(z);
            })
            client.postMessage({ files });
        }());
        return;
	}
});
