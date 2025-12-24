const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = 5322;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// Create HTTP server
const server = http.createServer((req, res) => {
    console.log(`[SERVER] Request: ${req.url}`);
    
    // Handle favicon requests
    if (req.url === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // Special route: dynamic asset manifest for Scene Builder
    if (req.url === '/asset-manifest.json') {
        try {
            const root = __dirname;
            const includeDirs = [
                path.join(root, 'Models', 'GameAssets'),
            ];
            const results = [];
            // Only serve static image formats suitable for editor tiling; exclude GIFs to reduce payload and memory
            const exts = new Set(['.png', '.jpg', '.jpeg', '.webp']);
            const walk = (dir) => {
                if (!fs.existsSync(dir)) return;
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const ent of entries) {
                    const full = path.join(dir, ent.name);
                    if (ent.isDirectory()) {
                        // Skip Character and Enemies directories anywhere
                        const base = ent.name.toLowerCase();
                        if (base.includes('character') || base.includes('enemie') || base.includes('enemy') || base.includes('guns') || base.includes('weapon')) continue;
                        walk(full);
                    } else {
                        const ext = path.extname(ent.name).toLowerCase();
                        if (!exts.has(ext)) continue;
                        // Skip overly large assets (> 8MB) for editor stability
                        try {
                            const stat = fs.statSync(full);
                            if (stat.size > 8 * 1024 * 1024) continue;
                        } catch (_) {}
                        const rel = full.replace(root, '').split(path.sep).join('/');
                        // Normalize leading slash
                        results.push(rel.startsWith('/') ? rel : '/' + rel);
                    }
                }
            };
            includeDirs.forEach(walk);
            const body = JSON.stringify({ version: 1, assets: results });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(body);
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'manifest_failed', message: String(e) }));
        }
        return;
    }

    // Parse URL
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = decodeURIComponent(filePath);
    
    // Get file extension
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Build full file path
    const fullPath = path.join(__dirname, filePath);
    
    console.log(`[SERVER] Serving: ${fullPath}`);
    
    // Read and serve file
    fs.readFile(fullPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                console.log(`[SERVER] File not found: ${fullPath}`);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>');
            } else {
                // Server error
                console.log(`[SERVER] Error reading file: ${err.code}`);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - Internal Server Error</h1>');
            }
        } else {
            // Success - serve file
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Necrotech Frontier server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🎮 Open your browser and navigate to: http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        PORT++;
        if (PORT > 8050) {
            console.error('❌ No available ports found between 8045-8050. Please close other applications using these ports.');
            process.exit(1);
        }
        console.log(`❌ Port ${PORT - 1} is already in use. Trying port ${PORT}...`);
        server.listen(PORT);
    } else {
        console.error('❌ Server error:', err);
    }
}); 