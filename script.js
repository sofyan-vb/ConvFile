const { jsPDF } = window.jspdf;
const { PDFDocument, rgb } = PDFLib;

// --- CONFIG PDF WORKER ---
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

let currentTool = '';
let uploadedFiles = [];

// DOM Elements
const landingView = document.getElementById('landing-view');
const appContainer = document.getElementById('app-container');
const dashboardView = document.getElementById('dashboard-view');
const workspaceView = document.getElementById('workspace-view');
const pageTitle = document.getElementById('page-title');
const toolNameDisplay = document.getElementById('tool-name-display');

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const convertBtn = document.getElementById('convert-btn');
const uploadInstruction = document.getElementById('upload-instruction');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');
const themeToggle = document.getElementById('theme-toggle');
const themeToggleLanding = document.getElementById('theme-toggle-landing');

// --- MAPPING ALAT KE KATEGORI ---
const toolCategories = {
    'merge-pdf': 'menu-utils',
    'split-pdf': 'menu-utils',
    'compress-pdf': 'menu-utils',
    
    'img-to-pdf': 'menu-to-pdf',
    'word-to-pdf': 'menu-to-pdf',
    'ppt-to-pdf': 'menu-to-pdf',
    'excel-to-pdf': 'menu-to-pdf',
    
    'pdf-to-word': 'menu-from-pdf',
    'pdf-to-ppt': 'menu-from-pdf',
    'pdf-to-excel': 'menu-from-pdf',
    'pdf-to-jpg': 'menu-from-pdf',
    'pdf-to-pdfa': 'menu-from-pdf'
};

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    loadHistory(); 
    if(landingView) landingView.style.display = 'flex';
    if(appContainer) appContainer.style.display = 'none';
});

// --- TRANSISI LANDING PAGE KE APP ---
window.enterApp = function() {
    landingView.style.opacity = '0';
    setTimeout(() => {
        landingView.style.display = 'none';
        appContainer.style.display = 'flex';
        appContainer.style.opacity = '0';
        requestAnimationFrame(() => {
            appContainer.style.transition = 'opacity 0.5s ease';
            appContainer.style.opacity = '1';
        });
        showDashboard(); 
    }, 400);
}

// --- THEME ---
function toggleTheme() { document.body.classList.toggle('dark-mode'); }
if(themeToggle) themeToggle.addEventListener('click', toggleTheme);
if(themeToggleLanding) themeToggleLanding.addEventListener('click', toggleTheme);

// --- NAVIGATION & SIDEBAR LOGIC ---
window.showDashboard = function() {
    if(dashboardView) dashboardView.style.display = 'flex'; 
    if(workspaceView) workspaceView.style.display = 'none';
    document.body.classList.add('dashboard-mode');
    if(pageTitle) pageTitle.innerText = "Dashboard";
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const dashBtn = document.querySelector('button[onclick="showDashboard()"]');
    if(dashBtn) dashBtn.classList.add('active');
}

window.selectTool = function(toolName) {
    if(dashboardView) dashboardView.style.display = 'none';
    if(workspaceView) workspaceView.style.display = 'flex';
    document.body.classList.remove('dashboard-mode');
    document.querySelectorAll('.nav-group').forEach(group => { group.style.display = 'none'; });
    const targetGroupId = toolCategories[toolName];
    if(targetGroupId) { document.getElementById(targetGroupId).style.display = 'block'; }
    currentTool = toolName;
    uploadedFiles = [];
    fileList.innerHTML = '';
    convertBtn.disabled = true;
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`button[onclick="selectTool('${toolName}')"]`);
    if(activeBtn) {
        activeBtn.classList.add('active');
        setTimeout(() => activeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
    let title = "Konversi";
    let accept = "*";
    let multiple = false;
    switch(toolName) {
        case 'merge-pdf': title = "Gabung PDF"; accept = ".pdf"; multiple = true; break;
        case 'split-pdf': title = "Pisah PDF"; accept = ".pdf"; break;
        case 'compress-pdf': title = "Kompres PDF"; accept = ".pdf"; break;
        case 'img-to-pdf': title = "JPG ke PDF"; accept = "image/*"; multiple = true; break;
        case 'word-to-pdf': title = "Word ke PDF"; accept = ".docx, .doc"; break;
        case 'ppt-to-pdf': title = "PPT ke PDF"; accept = ".pptx, .ppt"; break;
        case 'excel-to-pdf': title = "Excel ke PDF"; accept = ".xlsx, .xls"; break;
        case 'pdf-to-word': title = "PDF ke Word"; accept = ".pdf"; break;
        case 'pdf-to-ppt': title = "PDF ke PPT"; accept = ".pdf"; break;
        case 'pdf-to-excel': title = "PDF ke Excel"; accept = ".pdf"; break;
        case 'pdf-to-jpg': title = "PDF ke JPG"; accept = ".pdf"; break;
        case 'pdf-to-pdfa': title = "PDF ke PDF/A"; accept = ".pdf"; break;
    }
    if(pageTitle) pageTitle.innerText = title;
    if(toolNameDisplay) toolNameDisplay.innerText = title;
    fileInput.accept = accept;
    fileInput.multiple = multiple;
    uploadInstruction.innerText = multiple ? `Pilih banyak file ${accept}` : `Pilih file ${accept}`;
}

// --- HISTORY SYSTEM ---
function addToHistory(filename, tool) {
    let history = JSON.parse(localStorage.getItem('convProHistory')) || [];
    const newItem = {
        id: Date.now(),
        filename: filename,
        tool: tool,
        date: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})
    };
    history.unshift(newItem); 
    if(history.length > 20) history.pop();
    localStorage.setItem('convProHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    let history = JSON.parse(localStorage.getItem('convProHistory')) || [];
    const miniList = document.getElementById('mini-history-list');
    const mainList = document.getElementById('main-history-list');
    if (miniList) {
        miniList.innerHTML = history.length ? '' : '<div style="padding:10px; font-size:0.8rem; color:#888;">Kosong</div>';
        history.slice(0, 5).forEach(item => {
            miniList.innerHTML += `<div class="mini-hist-item"><span><i class="fas fa-check-circle text-green"></i> ${item.filename}</span></div>`;
        });
    }
    if (mainList) {
        if(history.length === 0) {
            mainList.innerHTML = `<div class="empty-state" style="text-align:center; padding:20px; color:#888;">Belum ada riwayat.</div>`;
        } else {
            mainList.innerHTML = '';
            history.forEach((item) => {
                mainList.innerHTML += `
                    <div class="hist-card">
                        <div class="hist-info">
                            <div class="hist-icon"><i class="fas fa-file-alt"></i></div>
                            <div class="hist-details"><h5>${item.filename}</h5><span>${item.tool} • ${item.date}</span></div>
                        </div>
                        <i class="fas fa-trash-alt hist-action" onclick="deleteHistoryItem(${item.id})"></i>
                    </div>
                `;
            });
        }
    }
}

window.deleteHistoryItem = function(id) {
    let history = JSON.parse(localStorage.getItem('convProHistory')) || [];
    history = history.filter(item => item.id !== id);
    localStorage.setItem('convProHistory', JSON.stringify(history));
    loadHistory();
}

window.clearHistory = function() {
    if(confirm("Hapus semua riwayat?")) {
        localStorage.removeItem('convProHistory');
        loadHistory();
    }
}

// --- FILE HANDLING ---
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#4F46E5'; });
dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = ''; });
dropZone.addEventListener('drop', (e) => {
    e.preventDefault(); dropZone.style.borderColor = '';
    handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleFiles(files) {
    if (fileInput.multiple) uploadedFiles = [...uploadedFiles, ...Array.from(files)];
    else uploadedFiles = Array.from(files);
    renderFileList();
}

function renderFileList() {
    fileList.innerHTML = '';
    if(uploadedFiles.length > 0) {
        uploadedFiles.forEach((f, index) => {
            fileList.innerHTML += `
                <div class="file-item">
                    <i class="fas fa-file"></i> 
                    <span style="flex:1; overflow:hidden; text-overflow:ellipsis;">${f.name}</span>
                    <i class="fas fa-times text-red" style="cursor:pointer" onclick="removeFile(${index})"></i>
                </div>`;
        });
        convertBtn.disabled = false;
    } else {
        convertBtn.disabled = true;
    }
}

window.removeFile = function(index) {
    uploadedFiles.splice(index, 1);
    renderFileList();
}

convertBtn.addEventListener('click', async () => {
    if (!uploadedFiles || uploadedFiles.length === 0) {
        showToast("Pilih file terlebih dahulu!", "error"); return;
    }
    loadingOverlay.style.display = 'flex';
    loadingText.innerText = "Menganalisis File...";
    convertBtn.disabled = true;
    try {
        setTimeout(async () => {
             try {
                 if (currentTool === 'merge-pdf') await processMergePdf();
                 else if (currentTool === 'split-pdf') await processSplitPdf();
                 else if (currentTool === 'compress-pdf') await processCompressPdf();
                 else if (currentTool === 'img-to-pdf') await processImgToPdfHighQuality();
                 else if (currentTool === 'word-to-pdf') await processWordToPdfPrint();
                 else if (currentTool === 'excel-to-pdf') await processExcelToPdfPrint();
                 else if (currentTool === 'ppt-to-pdf') await processPptToPdfPrint();
                 else if (currentTool === 'pdf-to-word') await processPdfToWordSmartV4(); 
                 else if (currentTool === 'pdf-to-ppt') await processPdfToPptSmartV4();
                 else if (currentTool === 'pdf-to-excel') await processPdfToExcelSmartV2();
                 else if (currentTool === 'pdf-to-jpg') await processPdfToJpg();
                 else if (currentTool === 'pdf-to-pdfa') await processPdfToPdfA();
             } catch (err) {
                 console.error(err);
                 showToast("Gagal: " + err.message, 'error');
                 loadingOverlay.style.display = 'none';
                 convertBtn.disabled = false;
             }
        }, 500);
    } catch (e) {
        alert("System Error: " + e.message);
    }
});

// CORE CONVERSION FUNCTIONS
async function processImgToPdfHighQuality() {
    loadingText.innerText = "Mengenerate PDF...";
    const doc = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    for (let i = 0; i < uploadedFiles.length; i++) {
        if (i > 0) doc.addPage();
        const file = uploadedFiles[i];
        const dataUrl = await readFile(file);
        const img = await loadImage(dataUrl);
        const widthRatio = pageWidth / img.width;
        const heightRatio = pageHeight / img.height;
        const ratio = widthRatio < heightRatio ? widthRatio : heightRatio;
        const finalWidth = img.width * ratio;
        const finalHeight = img.height * ratio;
        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;
        doc.addImage(img, 'JPEG', x, y, finalWidth, finalHeight);
    }
    doc.save("converted_images.pdf");
    addToHistory("converted_images.pdf", "JPG ke PDF");
    finishProcess();
}

async function processPdfToWordSmartV4() {
    const file = uploadedFiles[0];
    const arrayBuffer = await readFileArray(file);
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let htmlContent = "";
    loadingText.innerText = "Merekonstruksi Layout...";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        let items = textContent.items.map(item => ({
            str: item.str, x: Math.round(item.transform[4]), y: Math.round(item.transform[5]), w: item.width
        })).sort((a, b) => b.y - a.y || a.x - b.x);
        let rows = [];
        if(items.length > 0) {
            let currentRow = [items[0]];
            for(let j=1; j<items.length; j++) {
                if (Math.abs(items[j].y - currentRow[currentRow.length-1].y) < 5) currentRow.push(items[j]);
                else { rows.push(currentRow); currentRow = [items[j]]; }
            }
            rows.push(currentRow);
        }
        let pageHtml = "";
        rows.forEach(row => {
            row.sort((a, b) => a.x - b.x);
            let isTable = false;
            let lastX = row[0].x + row[0].w;
            for(let k=1; k<row.length; k++) { if(row[k].x - lastX > 30) isTable = true; lastX = row[k].x + row[k].w; }
            if(isTable || row.length > 3) {
                pageHtml += "<table style='width:100%; border:none; margin-bottom:5px;'><tr>";
                let cellText = row[0].str;
                let end = row[0].x + row[0].w;
                for(let k=1; k<row.length; k++) {
                    if (row[k].x - end > 30) { pageHtml += `<td style='padding:0 5px; vertical-align:top;'>${cellText}</td>`; cellText = row[k].str; }
                    else { cellText += (row[k].x - end > 3 ? " " : "") + row[k].str; }
                    end = row[k].x + row[k].w;
                }
                pageHtml += `<td style='padding:0 5px; vertical-align:top;'>${cellText}</td></tr></table>`;
            } else {
                let pText = ""; let lEnd = 0;
                row.forEach((item, idx) => { if (idx > 0 && (item.x - lEnd) > 4) pText += " "; pText += item.str; lEnd = item.x + item.w; });
                let align = row[0].x > 400 ? "right" : (row[0].x > 200 ? "center" : "left");
                pageHtml += `<p style='text-align:${align}; margin-left:${Math.floor(row[0].x/2)}pt; font-family:"Times New Roman",serif;'>${pText}</p>`;
            }
        });
        htmlContent += `<div class='Section' style='margin:40px;'>${pageHtml}</div><br clear=all style='page-break-before:always'>`;
    }
    const fullContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset='utf-8'></head><body>${htmlContent}</body></html>`;
    const newName = file.name.replace('.pdf', '.doc');
    saveAs(new Blob(['\ufeff', fullContent], { type: 'application/msword' }), newName);
    addToHistory(newName, "PDF ke Word");
    finishProcess();
}

async function processPdfToExcelSmartV2() {
    const file = uploadedFiles[0];
    const arrayBuffer = await readFileArray(file);
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let workbook = XLSX.utils.book_new();
    loadingText.innerText = "Mengekstrak Tabel...";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        let rowMap = {};
        textContent.items.forEach(item => {
            let y = Math.round(item.transform[5]);
            let key = Object.keys(rowMap).find(k => Math.abs(k - y) < 4) || y;
            if (!rowMap[key]) rowMap[key] = [];
            rowMap[key].push({ x: item.transform[4], str: item.str });
        });
        let sheetData = [];
        Object.keys(rowMap).sort((a, b) => b - a).forEach(y => {
            let items = rowMap[y].sort((a, b) => a.x - b.x);
            let row = [], cell = "", lx = -999;
            items.forEach(it => {
                if (it.x - lx > 20 && lx !== -999) { row.push(cell); cell = it.str; }
                else cell += (cell ? " " : "") + it.str;
                lx = it.x + (it.str.length * 5);
            });
            if(cell) row.push(cell);
            sheetData.push(row);
        });
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheetData), `Page ${i}`);
    }
    const newName = file.name.replace('.pdf', '.xlsx');
    XLSX.writeFile(workbook, newName);
    addToHistory(newName, "PDF ke Excel");
    finishProcess();
}

async function processPdfToPptSmartV4() {
    const file = uploadedFiles[0];
    const arrayBuffer = await readFileArray(file);
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const pres = new PptxGenJS();
    loadingText.innerText = "Menyusun Slide...";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const textContent = await page.getTextContent();
        const slide = pres.addSlide();
        textContent.items.forEach(item => {
            if(!item.str.trim()) return;
            slide.addText(item.str, { x: item.transform[4]/72, y: (viewport.height - item.transform[5])/72, fontSize: 11, color: "000000" });
        });
    }
    const newName = file.name.replace('.pdf', '.pptx');
    await pres.writeFile({ fileName: newName });
    addToHistory(newName, "PDF ke PPT");
    finishProcess();
}

async function processMergePdf() {
    if (uploadedFiles.length < 2) throw new Error("Pilih minimal 2 file.");
    const mergedPdf = await PDFDocument.create();
    for (const file of uploadedFiles) {
        const pdf = await PDFDocument.load(await readFileArray(file));
        (await mergedPdf.copyPages(pdf, pdf.getPageIndices())).forEach(p => mergedPdf.addPage(p));
    }
    const bytes = await mergedPdf.save();
    saveAs(new Blob([bytes], {type: "application/pdf"}), "merged_document.pdf");
    addToHistory("merged_document.pdf", "Merge PDF");
    finishProcess();
}

async function processSplitPdf() {
    const file = uploadedFiles[0];
    const pdfDoc = await PDFDocument.load(await readFileArray(file));
    const zip = new JSZip();
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const sub = await PDFDocument.create();
        const [cp] = await sub.copyPages(pdfDoc, [i]);
        sub.addPage(cp);
        zip.file(`Page_${i+1}.pdf`, await sub.save());
    }
    saveAs(await zip.generateAsync({type:"blob"}), "split_pages.zip");
    addToHistory("split_pages.zip", "Split PDF");
    finishProcess();
}

async function processCompressPdf() {
    const file = uploadedFiles[0];
    const pdfDoc = await PDFDocument.load(await readFileArray(file));
    const bytes = await pdfDoc.save({ useObjectStreams: false });
    saveAs(new Blob([bytes], {type: "application/pdf"}), file.name.replace('.pdf', '_min.pdf'));
    addToHistory(file.name.replace('.pdf', '_min.pdf'), "Kompres PDF");
    finishProcess();
}

async function processWordToPdfPrint() {
    await docx.renderAsync(await readFileArray(uploadedFiles[0]), document.getElementById('doc-container'), null, { inWrapper: false });
    preparePrint(uploadedFiles[0].name);
}
async function processExcelToPdfPrint() {
    const wb = XLSX.read(await readFileArray(uploadedFiles[0]), { type: 'array' });
    const html = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]]);
    document.getElementById('doc-container').innerHTML = `<style>table{border-collapse:collapse;width:100%;}td,th{border:1px solid #ccc;padding:4px;}</style>${html}`;
    preparePrint(uploadedFiles[0].name);
}
async function processPptToPdfPrint() {
    const zip = await new JSZip().loadAsync(uploadedFiles[0]);
    let slidesHTML = "", idx = 1;
    while(true) {
        const f = zip.file(`ppt/slides/slide${idx}.xml`);
        if(!f) break;
        const txt = (await f.async("string")).match(/<a:t>(.*?)<\/a:t>/g);
        let sTxt = ""; if(txt) txt.forEach(m => sTxt += `<p>${m.replace(/<.*?>/g, '')}</p>`);
        slidesHTML += `<div class="ppt-print-slide" style="border:1px solid #ddd; padding:40px; margin-bottom:20px;"><h4>Slide ${idx}</h4><div>${sTxt}</div></div>`;
        idx++;
    }
    document.getElementById('doc-container').innerHTML = slidesHTML;
    preparePrint(uploadedFiles[0].name);
}

async function processPdfToPdfA() {
    const pdf = await pdfjsLib.getDocument(await readFileArray(uploadedFiles[0])).promise;
    const doc = new jsPDF();
    for (let i = 1; i <= pdf.numPages; i++) {
        if (i > 1) doc.addPage();
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 2.0 });
        const cvs = document.createElement('canvas'); cvs.width = vp.width; cvs.height = vp.height;
        await page.render({ canvasContext: cvs.getContext('2d'), viewport: vp }).promise;
        doc.addImage(cvs.toDataURL('image/jpeg', 0.85), 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
    }
    doc.save(uploadedFiles[0].name.replace('.pdf', '_PDFA.pdf'));
    addToHistory(uploadedFiles[0].name.replace('.pdf', '_PDFA.pdf'), "PDF ke PDF/A");
    finishProcess();
}

async function processPdfToJpg() {
    const pdf = await pdfjsLib.getDocument(await readFileArray(uploadedFiles[0])).promise;
    const zip = new JSZip();
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 2.0 });
        const cvs = document.createElement('canvas'); cvs.width = vp.width; cvs.height = vp.height;
        await page.render({ canvasContext: cvs.getContext('2d'), viewport: vp }).promise;
        zip.file(`Page_${i}.jpg`, cvs.toDataURL('image/jpeg', 1.0).split(',')[1], {base64: true});
    }
    saveAs(await zip.generateAsync({type:"blob"}), uploadedFiles[0].name.replace('.pdf', '_images.zip'));
    addToHistory(uploadedFiles[0].name.replace('.pdf', '_images.zip'), "PDF ke JPG");
    finishProcess();
}

function showToast(msg, type='info') {
    const t = document.createElement('div'); t.className = `toast ${type}`;
    t.innerHTML = `<i class="fas ${type==='error'?'fa-exclamation-triangle':'fa-check-circle'}"></i> <span>${msg}</span>`;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 4000);
}
function preparePrint(fn) {
    const oldTitle = document.title; document.title = fn.replace(/\.[^/.]+$/, "");
    showToast("Jendela cetak terbuka. Pilih 'Simpan PDF'", "info");
    addToHistory(fn, "Konversi Print");
    setTimeout(() => { window.print(); document.title = oldTitle; finishProcess(); }, 1000);
}
function finishProcess() {
    loadingOverlay.style.display = 'none'; convertBtn.disabled = false;
    showToast("Selesai!", "success"); uploadedFiles = []; fileList.innerHTML = '';
}
function loadImage(src) { return new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; }); }
function readFile(f) { return new Promise(r => { const fr = new FileReader(); fr.onload = e => r(e.target.result); fr.readAsDataURL(f); }); }
function readFileArray(f) { return new Promise(r => { const fr = new FileReader(); fr.onload = e => r(e.target.result); fr.readAsArrayBuffer(f); }); }


/* TAMBAHKAN LOGIKA INI DI SCRIPT.JS */

const backBtn = document.getElementById('back-btn');

if (backBtn) {
    backBtn.addEventListener('click', () => {
        // Cek apakah sedang di tampilan Workspace (Tools)
        if (workspaceView.style.display === 'flex') {
            // Jika di Tools -> Kembali ke Dashboard
            showDashboard();
        } 
        // Cek apakah sedang di tampilan Dashboard
        else if (dashboardView.style.display === 'flex') {
            // Jika di Dashboard -> Kembali ke Landing Page
            goBackToLanding();
        }
    });
}

// Fungsi animasi kembali ke Landing Page
function goBackToLanding() {
    appContainer.style.opacity = '0';
    
    setTimeout(() => {
        appContainer.style.display = 'none';
        landingView.style.display = 'flex';
        
        // Reset animasi landing page
        landingView.style.opacity = '0';
        requestAnimationFrame(() => {
            landingView.style.transition = 'opacity 0.5s ease';
            landingView.style.opacity = '1';
        });
    }, 400);
}