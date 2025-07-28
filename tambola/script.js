class DynamicTambolaTicketA4 {
    constructor(config = {}) {
        // Default configuration
        this.config = {
            gridRows: config.gridRows || 2,        // How many rows of tickets on page
            gridCols: config.gridCols || 2,        // How many columns of tickets on page
            tambolaRows: config.tambolaRows || 3,  // Rows in each tambola ticket
            tambolaCols: config.tambolaCols || 9,  // Columns in each tambola ticket
            numbersPerRow: config.numbersPerRow || 5, // Numbers per row in tambola ticket
            pageMargin: config.pageMargin || 30,
            ticketSpacing: config.ticketSpacing || 20,
            headerHeight: config.headerHeight || 60,
            footerHeight: 10,
            ...config
        };
        
        // A4 dimensions at 150 DPI
        this.pageWidth = 1240;
        this.pageHeight = 1754;
        
        this.calculateDimensions();
        this.setupCanvas();
    }

    calculateDimensions() {
        // Calculate tickets per page
        this.ticketsPerPage = this.config.gridRows * this.config.gridCols;
        
        // Calculate available space
        const availableWidth = this.pageWidth - (2 * this.config.pageMargin) - 
                              ((this.config.gridCols - 1) * this.config.ticketSpacing);
        const availableHeight = this.pageHeight - (2 * this.config.pageMargin) - 
                               ((this.config.gridRows - 1) * this.config.ticketSpacing);
        
        // Calculate maximum ticket size
        this.ticketWidth = Math.floor(availableWidth / this.config.gridCols);
        this.ticketHeight = Math.floor(availableHeight / this.config.gridRows);
        
        // Calculate cell dimensions within each ticket
        const gridSpace = this.ticketHeight - this.config.headerHeight - this.config.footerHeight;
        this.cellWidth = Math.floor(this.ticketWidth / this.config.tambolaCols);
        this.cellHeight = Math.floor(gridSpace / this.config.tambolaRows);
        
        // Calculate font sizes based on cell size
        this.numberFontSize = Math.min(this.cellWidth * 0.4, this.cellHeight * 0.3, 32);
        this.headerFontSize = Math.max(12, Math.min(this.ticketWidth * 0.03, 20));
        this.footerFontSize = Math.max(10, Math.min(this.ticketWidth * 0.025, 16));
        
        console.log('Calculated dimensions:', {
            ticketsPerPage: this.ticketsPerPage,
            ticketSize: `${this.ticketWidth}×${this.ticketHeight}`,
            cellSize: `${this.cellWidth}×${this.cellHeight}`,
            numberFontSize: this.numberFontSize
        });
    }

    setupCanvas() {
        this.canvas = document.getElementById('tambolaCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.pageWidth;
        this.canvas.height = this.pageHeight;
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.height = 'auto';
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.calculateDimensions();
        console.log('Configuration updated:', this.config);
    }

    createTicketMatrix() {
        const ticket = Array(this.config.tambolaRows).fill().map(() => 
                      Array(this.config.tambolaCols).fill(0));
        
        // Create number ranges based on columns
        const ranges = [];
        const rangeSize = Math.floor(90 / this.config.tambolaCols);
        for (let col = 0; col < this.config.tambolaCols; col++) {
            const min = col * rangeSize + 1;
            const max = col === this.config.tambolaCols - 1 ? 90 : (col + 1) * rangeSize;
            ranges.push([min, max]);
        }

        // Fill each column with random numbers
        for (let col = 0; col < this.config.tambolaCols; col++) {
            const [min, max] = ranges[col];
            const numbersInColumn = Math.floor(Math.random() * this.config.tambolaRows) + 1;
            const positions = [];
            
            while (positions.length < numbersInColumn) {
                const pos = Math.floor(Math.random() * this.config.tambolaRows);
                if (!positions.includes(pos)) {
                    positions.push(pos);
                }
            }
            
            const numbers = [];
            while (numbers.length < numbersInColumn) {
                const num = min + Math.floor(Math.random() * (max - min + 1));
                if (!numbers.includes(num)) {
                    numbers.push(num);
                }
            }
            numbers.sort((a, b) => a - b);
            
            positions.forEach((pos, index) => {
                ticket[pos][col] = numbers[index];
            });
        }

        this.adjustRowCounts(ticket, ranges);
        return ticket;
    }

    adjustRowCounts(ticket, ranges) {
        for (let row = 0; row < this.config.tambolaRows; row++) {
            const currentCount = ticket[row].filter(cell => cell !== 0).length;
            
            if (currentCount < this.config.numbersPerRow) {
                const needed = this.config.numbersPerRow - currentCount;
                const emptyCols = [];
                for (let col = 0; col < this.config.tambolaCols; col++) {
                    if (ticket[row][col] === 0) {
                        emptyCols.push(col);
                    }
                }
                
                for (let i = 0; i < needed && emptyCols.length > 0; i++) {
                    const colIndex = Math.floor(Math.random() * emptyCols.length);
                    const col = emptyCols.splice(colIndex, 1)[0];
                    const [min, max] = ranges[col];
                    
                    let num;
                    do {
                        num = min + Math.floor(Math.random() * (max - min + 1));
                    } while (this.isNumberInColumn(ticket, col, num));
                    
                    ticket[row][col] = num;
                }
            } else if (currentCount > this.config.numbersPerRow) {
                const excess = currentCount - this.config.numbersPerRow;
                const filledCols = [];
                for (let col = 0; col < this.config.tambolaCols; col++) {
                    if (ticket[row][col] !== 0) {
                        filledCols.push(col);
                    }
                }
                
                for (let i = 0; i < excess; i++) {
                    const colIndex = Math.floor(Math.random() * filledCols.length);
                    const col = filledCols.splice(colIndex, 1)[0];
                    ticket[row][col] = 0;
                }
            }
        }
        
        // Sort numbers in each column
        for (let col = 0; col < this.config.tambolaCols; col++) {
            const colNumbers = [];
            const positions = [];
            
            for (let row = 0; row < this.config.tambolaRows; row++) {
                if (ticket[row][col] !== 0) {
                    colNumbers.push(ticket[row][col]);
                    positions.push(row);
                    ticket[row][col] = 0;
                }
            }
            
            colNumbers.sort((a, b) => a - b);
            positions.forEach((pos, index) => {
                ticket[pos][col] = colNumbers[index];
            });
        }
    }

    isNumberInColumn(ticket, col, num) {
        for (let row = 0; row < this.config.tambolaRows; row++) {
            if (ticket[row][col] === num) {
                return true;
            }
        }
        return false;
    }

    drawSingleTicket(ticketData, x, y, ticketNumber) {
        const ctx = this.ctx;
        
        // Draw ticket border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, Math.floor(this.ticketWidth / 200));
        ctx.strokeRect(x, y, this.ticketWidth, this.ticketHeight);
        
        // Fill ticket background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 1, y + 1, this.ticketWidth - 2, this.ticketHeight - 2);
        
        // Draw header
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${this.headerFontSize}px Arial`;
        ctx.textAlign = 'left';
        const headerPadding = Math.max(5, this.ticketWidth * 0.02);
        ctx.fillText(`Ticket No: ${ticketNumber}`, x + headerPadding, y + this.headerFontSize + 5);
        
        ctx.textAlign = 'right';
        ctx.fillText('Tambola Tickets', x + this.ticketWidth - headerPadding, y + this.headerFontSize + 5);
        
        // Draw line below header
        ctx.lineWidth = Math.max(1, Math.floor(this.ticketWidth / 300));
        ctx.beginPath();
        ctx.moveTo(x + headerPadding, y + this.config.headerHeight - 15);
        ctx.lineTo(x + this.ticketWidth - headerPadding, y + this.config.headerHeight - 15);
        ctx.stroke();
        
        // Draw grid
        const gridStartY = y + this.config.headerHeight;
        const gridHeight = this.config.tambolaRows * this.cellHeight;
        
        // Draw horizontal lines
        ctx.lineWidth = Math.max(1, Math.floor(this.ticketWidth / 400));
        for (let i = 0; i <= this.config.tambolaRows; i++) {
            const lineY = gridStartY + i * this.cellHeight;
            ctx.beginPath();
            ctx.moveTo(x, lineY);
            ctx.lineTo(x + this.ticketWidth, lineY);
            ctx.stroke();
        }
        
        // Draw vertical lines
        for (let i = 0; i <= this.config.tambolaCols; i++) {
            const lineX = x + i * this.cellWidth;
            ctx.beginPath();
            ctx.moveTo(lineX, gridStartY);
            ctx.lineTo(lineX, gridStartY + gridHeight);
            ctx.stroke();
        }
        
        // Fill cells and draw numbers
        ctx.font = `bold ${this.numberFontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let row = 0; row < this.config.tambolaRows; row++) {
            for (let col = 0; col < this.config.tambolaCols; col++) {
                const cellX = x + col * this.cellWidth;
                const cellY = gridStartY + row * this.cellHeight;
                
                if (ticketData[row] && ticketData[row][col] !== 0) {
                    // Fill cell with light color
                    ctx.fillStyle = '#f8f8f8';
                    ctx.fillRect(cellX + 1, cellY + 1, this.cellWidth - 2, this.cellHeight - 2);
                    
                    // Draw number
                    ctx.fillStyle = '#000000';
                    ctx.fillText(
                        ticketData[row][col].toString(),
                        cellX + this.cellWidth / 2,
                        cellY + this.cellHeight / 2
                    );
                }
            }
        }
    }

    generatePage(startTicketNumber = 1) {
        const ctx = this.ctx;
        
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.pageWidth, this.pageHeight);
        
        // Generate tickets
        const tickets = [];
        for (let i = 0; i < this.ticketsPerPage; i++) {
            tickets.push(this.createTicketMatrix());
        }
        
        // Draw tickets in grid
        let ticketNumber = startTicketNumber;
        for (let row = 0; row < this.config.gridRows; row++) {
            for (let col = 0; col < this.config.gridCols; col++) {
                const ticketIndex = row * this.config.gridCols + col;
                if (ticketIndex < tickets.length) {
                    const x = this.config.pageMargin + col * (this.ticketWidth + this.config.ticketSpacing);
                    const y = this.config.pageMargin + row * (this.ticketHeight + this.config.ticketSpacing);
                    
                    this.drawSingleTicket(tickets[ticketIndex], x, y, ticketNumber);
                    ticketNumber++;
                }
            }
        }
        
        // Add page information
        // ctx.fillStyle = '#333333';
        // ctx.font = `${Math.max(10, this.footerFontSize)}px Arial`;
        // ctx.textAlign = 'center';
        // const endTicket = startTicketNumber + this.ticketsPerPage - 1;
        // ctx.fillText(
        //     `${this.config.gridRows}×${this.config.gridCols} Layout - Page ${Math.floor((startTicketNumber - 1) / this.ticketsPerPage) + 1} - Tickets ${startTicketNumber} to ${endTicket}`, 
        //     this.pageWidth / 2, 
        //     this.pageHeight - 15
        // );
    }

    downloadPage() {
        const layout = `${this.config.gridRows}x${this.config.gridCols}`;
        const link = document.createElement('a');
        link.download = `tambola-${layout}-page-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png', 1.0);
        link.click();
    }
}

// Batch Generator with Dynamic Configuration
class DynamicBatchA4Generator {
    constructor(config) {
        this.config = config;
        this.a4Generator = new DynamicTambolaTicketA4(config);
        this.generatedPages = [];
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.a4Generator.updateConfig(newConfig);
    }

    async generateMultiplePages(totalTickets) {
        const ticketsPerPage = this.a4Generator.ticketsPerPage;
        const pagesNeeded = Math.ceil(totalTickets / ticketsPerPage);
        this.generatedPages = [];
        
        const progressDiv = document.getElementById('progress');
        
        if (progressDiv) {
            progressDiv.style.display = 'block';
        }

        for (let page = 0; page < pagesNeeded; page++) {
            const startTicketNumber = (page * ticketsPerPage) + 1;
            const endTicketNumber = Math.min((page + 1) * ticketsPerPage, totalTickets);
            
            this.a4Generator.generatePage(startTicketNumber);
            
            const pageData = {
                pageNumber: page + 1,
                startTicket: startTicketNumber,
                endTicket: endTicketNumber,
                imageData: this.a4Generator.canvas.toDataURL('image/png', 1.0)
            };
            
            this.generatedPages.push(pageData);
            
            if (progressDiv) {
                const progress = Math.round(((page + 1) / pagesNeeded) * 100);
                const layout = `${this.config.gridRows}×${this.config.gridCols}`;
                progressDiv.innerHTML = `Generating ${layout} pages... ${progress}% (${page + 1}/${pagesNeeded})`;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (progressDiv) {
            progressDiv.style.display = 'none';
        }
        
        return this.generatedPages;
    }

    async downloadAllPagesAsZip(pages) {
        if (typeof JSZip === 'undefined') {
            alert('JSZip library is required for batch download.');
            return;
        }

        const zip = new JSZip();
        const layout = `${this.config.gridRows}x${this.config.gridCols}`;
        const folder = zip.folder(`tambola-${layout}-pages`);

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const imageData = page.imageData.split(',')[1];
            folder.file(`page-${page.pageNumber.toString().padStart(2, '0')}-tickets-${page.startTicket}-to-${page.endTicket}.png`, 
                       imageData, {base64: true});
        }

        const progressDiv = document.getElementById('progress');
        if (progressDiv) {
            progressDiv.innerHTML = 'Creating ZIP file...';
            progressDiv.style.display = 'block';
        }

        try {
            const content = await zip.generateAsync({type: "blob"});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `tambola-${layout}-pages-${Date.now()}.zip`;
            link.click();
            
            if (progressDiv) {
                progressDiv.style.display = 'none';
            }
        } catch (error) {
            console.error('Error creating ZIP:', error);
        }
    }
}

// Global variables
let dynamicGenerator;
let dynamicBatchGenerator;
let currentConfig = {
    gridRows: 2,
    gridCols: 2,
    tambolaRows: 3,
    tambolaCols: 9,
    numbersPerRow: 5
};

// Initialize
window.onload = function() {
    dynamicGenerator = new DynamicTambolaTicketA4(currentConfig);
    dynamicBatchGenerator = new DynamicBatchA4Generator(currentConfig);
    dynamicGenerator.generatePage(1);
    updateConfigDisplay();
};

// Configuration Functions
function updateGridLayout() {
    const rows = parseInt(document.getElementById('gridRows').value);
    const cols = parseInt(document.getElementById('gridCols').value);
    
    if (rows > 0 && cols > 0 && rows <= 6 && cols <= 6) {
        currentConfig.gridRows = rows;
        currentConfig.gridCols = cols;
        
        dynamicGenerator.updateConfig(currentConfig);
        dynamicBatchGenerator.updateConfig(currentConfig);
        dynamicGenerator.generatePage(1);
        updateConfigDisplay();
    } else {
        alert('Grid size must be between 1x1 and 6x6');
    }
}

function updateTambolaLayout() {
    const rows = parseInt(document.getElementById('tambolaRows').value);
    const cols = parseInt(document.getElementById('tambolaCols').value);
    const numbersPerRow = parseInt(document.getElementById('numbersPerRow').value);
    
    if (rows > 0 && cols > 0 && numbersPerRow > 0 && numbersPerRow <= cols) {
        currentConfig.tambolaRows = rows;
        currentConfig.tambolaCols = cols;
        currentConfig.numbersPerRow = numbersPerRow;
        
        dynamicGenerator.updateConfig(currentConfig);
        dynamicBatchGenerator.updateConfig(currentConfig);
        dynamicGenerator.generatePage(1);
        updateConfigDisplay();
    } else {
        alert('Invalid tambola layout. Numbers per row cannot exceed total columns.');
    }
}

function applyPreset(preset) {
    switch(preset) {
        case 'large': // 1x1 - Maximum size single ticket
            currentConfig = { gridRows: 1, gridCols: 1, tambolaRows: 3, tambolaCols: 9, numbersPerRow: 5 };
            break;
        case 'standard': // 2x2 - Standard layout
            currentConfig = { gridRows: 2, gridCols: 2, tambolaRows: 3, tambolaCols: 9, numbersPerRow: 5 };
            break;
        case 'compact': // 3x4 - Many tickets per page
            currentConfig = { gridRows: 4, gridCols: 3, tambolaRows: 3, tambolaCols: 9, numbersPerRow: 5 };
            break;
        case 'mini': // 4x4 - Mini tickets
            currentConfig = { gridRows: 4, gridCols: 4, tambolaRows: 3, tambolaCols: 9, numbersPerRow: 5 };
            break;
    }
    
    updateConfigInputs();
    dynamicGenerator.updateConfig(currentConfig);
    dynamicBatchGenerator.updateConfig(currentConfig);
    dynamicGenerator.generatePage(1);
    updateConfigDisplay();
}

function updateConfigInputs() {
    document.getElementById('gridRows').value = currentConfig.gridRows;
    document.getElementById('gridCols').value = currentConfig.gridCols;
    document.getElementById('tambolaRows').value = currentConfig.tambolaRows;
    document.getElementById('tambolaCols').value = currentConfig.tambolaCols;
    document.getElementById('numbersPerRow').value = currentConfig.numbersPerRow;
}

function updateConfigDisplay() {
    const ticketsPerPage = currentConfig.gridRows * currentConfig.gridCols;
    const pagesFor120 = Math.ceil(120 / ticketsPerPage);
    
    document.getElementById('configInfo').innerHTML = `
        <strong>Current Layout:</strong> ${currentConfig.gridRows}×${currentConfig.gridCols} grid (${ticketsPerPage} tickets per page)<br>
        <strong>Tambola Grid:</strong> ${currentConfig.tambolaRows}×${currentConfig.tambolaCols} with ${currentConfig.numbersPerRow} numbers per row<br>
        <strong>For 120 tickets:</strong> ${pagesFor120} A4 pages needed
    `;
}

// Generation Functions
function generateSinglePage() {
    const startNumber = parseInt(prompt("Enter starting ticket number:")) || 1;
    dynamicGenerator.generatePage(startNumber);
}

function downloadCurrentPage() {
    dynamicGenerator.downloadPage();
}

async function generateBatch() {
    const totalTickets = parseInt(prompt("Enter total number of tickets:")) || 120;
    if (totalTickets > 0) {
        const pages = await dynamicBatchGenerator.generateMultiplePages(totalTickets);
        window.generatedPages = pages;
        document.getElementById('downloadZipBtn').style.display = 'inline-block';
        
        const autoDownload = confirm(`Generated ${pages.length} pages with ${totalTickets} tickets.\n\nDownload now?`);
        if (autoDownload) {
            downloadBatchAsZip();
        }
    }
}

function downloadBatchAsZip() {
    if (window.generatedPages && dynamicBatchGenerator) {
        dynamicBatchGenerator.downloadAllPagesAsZip(window.generatedPages);
    }
}
function apply6x2Layout() {
    currentConfig = {
        gridRows: 6,
        gridCols: 2,
        tambolaRows: 3,
        tambolaCols: 9,
        numbersPerRow: 5
    };
    
    updateConfigInputs();
    dynamicGenerator.updateConfig(currentConfig);
    dynamicBatchGenerator.updateConfig(currentConfig);
    dynamicGenerator.generatePage(1);
    updateConfigDisplay();
}

