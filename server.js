const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

// Enable CORS
app.use(cors());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, './')));

// Explicitly serve the Photos_Overlay directory with CORS headers
app.use('/Photos_Overlay', express.static(path.join(__dirname, 'Photos_Overlay'), {
    setHeaders: (res) => {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        // Add CORS headers
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
    }
}));

// Serve static files with explicit MIME types and CORS for other files
app.use(express.static(path.join(__dirname, './'), {
    setHeaders: (res, path) => {
        // Log all static file requests for debugging
        console.log('Serving static file:', path);
        
        if (path.endsWith('.mp4')) {
            res.set('Content-Type', 'video/mp4');
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            res.set('Accept-Ranges', 'bytes');
            res.set('Access-Control-Allow-Origin', '*');
        }
    },
    // Enable case sensitivity for file paths
    caseSensitive: true,
    // Don't redirect to add trailing slash
    redirect: false
}));

// Video streaming endpoint
app.get('/Videos/:filename', (req, res) => {
    const filename = req.params.filename;
    const videosDir = path.join(__dirname, 'Videos');
    const filePath = path.join(videosDir, filename);
    
    console.log(`Video request for: ${filename}`);
    
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            return res.status(404).send('Video not found');
        }
        
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;
        
        if (range) {
            // Parse Range header
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end - start) + 1;
            
            // Create read stream for the specified range
            const file = fs.createReadStream(filePath, { start, end });
            
            // Set headers for partial content
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Access-Control-Allow-Origin': '*'
            };
            
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            // If no range requested, send the whole file
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Access-Control-Allow-Origin': '*'
            };
            
            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (error) {
        console.error(`Error streaming video ${filename}:`, error);
        res.status(500).send('Error streaming video');
    }
});

// Explicit route for videos to ensure case-insensitive matching
app.get('/videos/:filename', (req, res) => {
    const filename = req.params.filename;
    // Use the correct case for the Videos directory
    const videosDir = path.join(__dirname, 'Videos');
    console.log('Videos directory path:', videosDir);
    
    console.log(`Video request for: ${filename}`);
    
    try {
        // Get list of files in Videos directory (case-insensitive check)
        const files = fs.readdirSync(videosDir);
        const matchedFile = files.find(file => 
            file.toLowerCase() === filename.toLowerCase()
        );
        
        if (!matchedFile) {
            console.error('File not found. Available files:', files);
            return res.status(404).json({
                error: 'File not found',
                requested: filename,
                available: files
            });
        }
        
        const filePath = path.join(videosDir, matchedFile);
        console.log(`Serving video file: ${filePath}`);
        
        // Stream the video file
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;
        
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] 
                ? parseInt(parts[1], 10)
                : fileSize - 1;
                
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(filePath, {start, end});
            
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
                'Cache-Control': 'public, max-age=31536000',
                'Access-Control-Allow-Origin': '*'
            };
            
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
                'Cache-Control': 'public, max-age=31536000',
                'Access-Control-Allow-Origin': '*'
            };
            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (err) {
        console.error('Error serving video:', err);
        res.status(500).json({ 
            error: 'Error serving video',
            details: err.message 
        });
    }
});

// Serve index.html as the default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle video streaming with improved error handling
app.get('/videos/:filename', (req, res) => {
    const filename = req.params.filename;
    const videosDir = path.join(__dirname, 'Videos');
    let filePath = '';

    // Log request
    console.log(`Video request for ${filename}`);
    
    try {
        // Get list of files in Videos directory (case-insensitive check)
        const files = fs.readdirSync(videosDir);
        console.log('Available video files:', files);
        
        // Find the file (case-insensitive)
        const matchedFile = files.find(file => file.toLowerCase() === filename.toLowerCase());
        
        if (!matchedFile) {
            console.error(`File not found: ${filename}`);
            return res.status(404).json({ 
                error: 'File not found in Videos directory',
                filename,
                availableFiles: files
            });
        }
        
        // Use the actual filename (with correct case)
        filePath = path.join(videosDir, matchedFile);
        console.log(`Serving file: ${filePath}`);
        
    } catch (err) {
        console.error('Error accessing Videos directory:', err);
        return res.status(500).json({ 
            error: 'Server error accessing Videos directory',
            details: err.message 
        });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filename} at ${filePath}`);
        return res.status(404).json({ 
            error: 'File not found at specified path',
            filename,
            path: filePath
        });
    }

    try {
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            // Handle partial content request
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            
            // Validate the range
            if (isNaN(start) || start >= fileSize) {
                return res.status(416).json({ error: 'Range Not Satisfiable' });
            }
            
            const chunksize = end - start + 1;
            const fileStream = fs.createReadStream(filePath, { start, end });
            
            // Set headers for video streaming
            const ext = path.extname(filename).toLowerCase();
            const mimeTypes = {
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogg': 'video/ogg',
                '.mov': 'video/quicktime'
            };
            
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': mimeTypes[ext] || 'application/octet-stream',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=31536000',
                'Cross-Origin-Resource-Policy': 'cross-origin'
            };
            
            res.writeHead(206, head);
            fileStream.pipe(res);
        } else {
            // Full file request
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            
            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (error) {
        console.error(`Error streaming video ${filename}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Handle image streaming
app.get('/Photos/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'Photos', filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'image/png',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'image/png',
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
