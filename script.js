const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const results = document.getElementById('results');
const shortUrlCheck = document.getElementById('shortUrl');
const anonymousCheck = document.getElementById('anonymousUpload');
const adOverlay = document.getElementById('adOverlay');
const adClose = document.getElementById('adClose');

// Telegram elements (assuming they exist in HTML)
const telegramBtn = document.querySelector('.telegram-btn');
const telegramHeaderBtn = document.querySelector('.telegram-header-btn');
const telegramFooterBtn = document.querySelector('.telegram-footer-btn');

let selectedFiles = [];
let isUploading = false;

// Show ad popup on load
window.addEventListener('load', () => {
    setTimeout(() => {
        adOverlay.classList.add('show');
    }, 1000);
});

// Close ad popup
adClose.addEventListener('click', () => {
    adOverlay.classList.remove('show');
});

adOverlay.addEventListener('click', (e) => {
    if (e.target === adOverlay) {
        adOverlay.classList.remove('show');
    }
});

// Telegram button click handlers
if (telegramBtn) {
    telegramBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('https://t.me/cwebdepanbot', '_blank');
    });
}

if (telegramHeaderBtn) {
    telegramHeaderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('https://t.me/cwebdepanbot', '_blank');
    });
}

if (telegramFooterBtn) {
    telegramFooterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('https://t.me/cwebdepanbot', '_blank');
    });
}

// Click to browse
dropZone.addEventListener('click', () => {
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Drag and drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('drag-over');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('drag-over');
    }, false);
});

dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}, false);

// Handle files
function handleFiles(files) {
    if (isUploading) return;
    
    selectedFiles = Array.from(files);
    
    if (selectedFiles.length > 0) {
        uploadBtn.disabled = false;
        const fileCount = selectedFiles.length;
        const totalSize = formatBytes(selectedFiles.reduce((acc, file) => acc + file.size, 0));
        
        dropZone.querySelector('h2').textContent = `${fileCount} file${fileCount > 1 ? 's' : ''} selected`;
        dropZone.querySelector('.subtitle').textContent = `Total size: ${totalSize}`;
        
        // Update file info with selected files count
        dropZone.querySelector('.file-info').textContent = `${fileCount} file${fileCount > 1 ? 's' : ''} • ${totalSize}`;
    }
}

// Upload button
uploadBtn.addEventListener('click', () => {
    if (selectedFiles.length === 0 || isUploading) return;
    
    isUploading = true;
    const btnIcon = uploadBtn.querySelector('svg');
    const btnText = uploadBtn.querySelector('span');
    const originalText = btnText.textContent;
    const originalIcon = btnIcon.outerHTML;
    
    // Show uploading state
    btnText.textContent = 'Uploading...';
    uploadBtn.disabled = true;
    
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            clearInterval(progressInterval);
            
            // Show success state briefly
            btnText.textContent = 'Upload Complete!';
            btnIcon.style.opacity = '0';
            
            setTimeout(() => {
                displayResults();
                
                // Reset button state
                btnText.textContent = originalText;
                btnIcon.style.opacity = '1';
                uploadBtn.disabled = false;
                isUploading = false;
                
                // Reset drop zone
                selectedFiles = [];
                fileInput.value = '';
                dropZone.querySelector('h2').textContent = 'Drag & Drop Files Here';
                dropZone.querySelector('.subtitle').textContent = 'or click to browse from your device';
                dropZone.querySelector('.file-info').textContent = 'Supports all file types • Max 100GB per file';
            }, 1000);
        }
    }, 200);
});

// Display results
function displayResults() {
    results.innerHTML = '';
    results.classList.add('show');
    
    selectedFiles.forEach((file, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const randomId = generateRandomId(shortUrlCheck.checked ? 6 : 12);
        const url = `https://filebox.example/${randomId}`;
        
        resultItem.innerHTML = `
            <div class="result-header">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatBytes(file.size)}</span>
            </div>
            <div class="result-url">
                <input type="text" class="url-input" value="${url}" readonly>
                <button class="copy-btn" data-url="${url}">Copy</button>
            </div>
        `;
        
        results.appendChild(resultItem);
        
        // Add copy functionality
        const copyBtn = resultItem.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => {
            copyToClipboard(url, copyBtn);
        });
    });
    
    // Scroll to results with smooth animation
    setTimeout(() => {
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// Copy to clipboard
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        // Add checkmark icon
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 4px;">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
        `;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
            button.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        button.textContent = 'Failed!';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    });
}

// Helper functions
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function generateRandomId(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl + U to open file picker
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        fileInput.click();
    }
    
    // Escape to close ad popup
    if (e.key === 'Escape' && adOverlay.classList.contains('show')) {
        adOverlay.classList.remove('show');
    }
});

// File validation
function validateFile(file) {
    const maxSize = 100 * 1024 * 1024 * 1024; // 100GB in bytes
    if (file.size > maxSize) {
        alert(`File "${file.name}" exceeds maximum size of 100GB`);
        return false;
    }
    return true;
}

// Reset button
function resetUpload() {
    selectedFiles = [];
    fileInput.value = '';
    uploadBtn.disabled = true;
    dropZone.querySelector('h2').textContent = 'Drag & Drop Files Here';
    dropZone.querySelector('.subtitle').textContent = 'or click to browse from your device';
    dropZone.querySelector('.file-info').textContent = 'Supports all file types • Max 100GB per file';
    
    // Clear results if showing
    results.classList.remove('show');
    results.innerHTML = '';
}

// Add reset functionality to file info click
dropZone.querySelector('.file-info').addEventListener('click', (e) => {
    if (selectedFiles.length > 0 && !isUploading) {
        if (confirm('Clear all selected files?')) {
            resetUpload();
        }
    }
});

// Animation for result items
function animateResults() {
    const items = document.querySelectorAll('.result-item');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}
