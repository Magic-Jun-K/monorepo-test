/**
 * Excel 导出工具函数
 * 使用 Web Worker 在后台线程处理大量数据
 */

export interface ExcelRow {
  index: number;
  name: string;
  age: string;
  address: string;
  phone: string;
}

export interface ExportProgress {
  type: 'progress';
  processed: number;
  total: number;
  percent: number;
}

export interface ExportComplete {
  type: 'complete';
  buffer: Uint8Array;
  processed: number;
  total: number;
}

export interface ExportError {
  type: 'error';
  error: string;
}

export type ExportMessage = ExportProgress | ExportComplete | ExportError;

// Worker 代码（内联方式）
const workerCode = `
// CRC32 表
const crc32Table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crc32Table[i] = c;
}

const crc32 = (data) => {
  let crc = ~0;
  for (let i = 0; i < data.length; i++) {
    crc = (crc32Table[(crc ^ data[i]) & 0xff] || 0) ^ (crc >>> 8);
  }
  return ~crc >>> 0;
};

const escapeXml = (str) => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

self.onmessage = function(e) {
  const { rowData, headers, batchSize = 50000 } = e.data;
  
  try {
    const totalRows = rowData.length;
    let processedRows = 0;
    
    const contentTypes = \`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
</Types>\`;

    const rels = \`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>\`;

    const workbookRels = \`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>\`;

    const styles = \`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="12"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="E0E7FF"/></patternFill></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
  </cellXfs>
</styleSheet>\`;

    const workbook = \`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="数据" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>\`;

    const sheetXmlParts = [];
    sheetXmlParts.push(\`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:E\${totalRows + 1}"/>
  <sheetViews>
    <sheetView tabSelected="1" workbookViewId="0"/>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>
    <col min="1" max="1" width="10" customWidth="1"/>
    <col min="2" max="2" width="15" customWidth="1"/>
    <col min="3" max="3" width="10" customWidth="1"/>
    <col min="4" max="4" width="30" customWidth="1"/>
    <col min="5" max="5" width="18" customWidth="1"/>
  </cols>
  <sheetData>
    <row r="1" spans="1:5">\`);

    const sharedStrings = [];
    headers.forEach((header, index) => {
      const cellRef = String.fromCharCode(65 + index) + '1';
      const strIndex = sharedStrings.length;
      sharedStrings.push(header);
      sheetXmlParts.push(\`<c r="\${cellRef}" t="s" s="1"><v>\${strIndex}</v></c>\`);
    });
    sheetXmlParts.push('</row>');

    for (let i = 0; i < rowData.length; i++) {
      const row = rowData[i];
      const rowNum = i + 2;
      const rowParts = [\`<row r="\${rowNum}" spans="1:5">\`];

      rowParts.push(\`<c r="A\${rowNum}"><v>\${row.index}</v></c>\`);

      let strIndex = sharedStrings.indexOf(row.name);
      if (strIndex === -1) {
        strIndex = sharedStrings.length;
        sharedStrings.push(row.name);
      }
      rowParts.push(\`<c r="B\${rowNum}" t="s"><v>\${strIndex}</v></c>\`);

      rowParts.push(\`<c r="C\${rowNum}"><v>\${row.age}</v></c>\`);

      strIndex = sharedStrings.indexOf(row.address);
      if (strIndex === -1) {
        strIndex = sharedStrings.length;
        sharedStrings.push(row.address);
      }
      rowParts.push(\`<c r="D\${rowNum}" t="s"><v>\${strIndex}</v></c>\`);

      strIndex = sharedStrings.indexOf(row.phone);
      if (strIndex === -1) {
        strIndex = sharedStrings.length;
        sharedStrings.push(row.phone);
      }
      rowParts.push(\`<c r="E\${rowNum}" t="s"><v>\${strIndex}</v></c>\`);

      rowParts.push('</row>');
      sheetXmlParts.push(rowParts.join(''));

      processedRows++;
      
      if (processedRows % batchSize === 0) {
        self.postMessage({ 
          type: 'progress', 
          processed: processedRows, 
          total: totalRows,
          percent: Math.round((processedRows / totalRows) * 100)
        });
      }
    }

    sheetXmlParts.push(\`</sheetData>
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>\`);

    const sheetXml = sheetXmlParts.join('');

    const sharedStringsXml = \`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="\${sharedStrings.length}" uniqueCount="\${sharedStrings.length}">
\${sharedStrings.map(s => \`<si><t>\${escapeXml(s)}</t></si>\`).join('\\n')}
</sst>\`;

    const zipFiles = [
      { name: '[Content_Types].xml', content: contentTypes },
      { name: '_rels/.rels', content: rels },
      { name: 'xl/_rels/workbook.xml.rels', content: workbookRels },
      { name: 'xl/workbook.xml', content: workbook },
      { name: 'xl/styles.xml', content: styles },
      { name: 'xl/sharedStrings.xml', content: sharedStringsXml },
      { name: 'xl/worksheets/sheet1.xml', content: sheetXml },
    ];

    const encoder = new TextEncoder();
    const zipParts = [];
    const centralDirectory = [];
    let offset = 0;

    for (const file of zipFiles) {
      const contentBytes = encoder.encode(file.content);
      const fileCrc = crc32(contentBytes);
      const fileNameBytes = encoder.encode(file.name);

      const localHeader = new Uint8Array(30 + fileNameBytes.length);
      const view = new DataView(localHeader.buffer);
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, 0, true);
      view.setUint16(12, 0, true);
      view.setUint32(14, fileCrc, true);
      view.setUint32(18, contentBytes.length, true);
      view.setUint32(22, contentBytes.length, true);
      view.setUint16(26, fileNameBytes.length, true);
      view.setUint16(28, 0, true);
      localHeader.set(fileNameBytes, 30);

      zipParts.push(localHeader);
      zipParts.push(contentBytes);

      const centralRecord = new Uint8Array(46 + fileNameBytes.length);
      const centralView = new DataView(centralRecord.buffer);
      centralView.setUint32(0, 0x02014b50, true);
      centralView.setUint16(4, 20, true);
      centralView.setUint16(6, 20, true);
      centralView.setUint16(8, 0, true);
      centralView.setUint16(10, 0, true);
      centralView.setUint16(12, 0, true);
      centralView.setUint16(14, 0, true);
      centralView.setUint32(16, fileCrc, true);
      centralView.setUint32(20, contentBytes.length, true);
      centralView.setUint32(24, contentBytes.length, true);
      centralView.setUint16(28, fileNameBytes.length, true);
      centralView.setUint16(30, 0, true);
      centralView.setUint16(32, 0, true);
      centralView.setUint16(34, 0, true);
      centralView.setUint16(36, 0, true);
      centralView.setUint32(38, 0, true);
      centralView.setUint32(42, offset, true);
      centralRecord.set(fileNameBytes, 46);

      centralDirectory.push(centralRecord);
      offset += localHeader.length + contentBytes.length;
    }

    const centralDirOffset = offset;
    for (const record of centralDirectory) {
      zipParts.push(record);
      offset += record.length;
    }

    const endRecord = new Uint8Array(22);
    const endView = new DataView(endRecord.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(4, 0, true);
    endView.setUint16(6, 0, true);
    endView.setUint16(8, zipFiles.length, true);
    endView.setUint16(10, zipFiles.length, true);
    endView.setUint32(12, offset - centralDirOffset, true);
    endView.setUint32(16, centralDirOffset, true);
    endView.setUint16(20, 0, true);

    zipParts.push(endRecord);

    const totalLength = zipParts.reduce((sum, part) => sum + part.length, 0);
    const zipData = new Uint8Array(totalLength);
    let pos = 0;
    for (const part of zipParts) {
      zipData.set(part, pos);
      pos += part.length;
    }

    self.postMessage({ 
      type: 'complete', 
      buffer: zipData,
      processed: processedRows,
      total: totalRows
    }, [zipData.buffer]);

  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error.message || String(error)
    });
  }
};
`;

// 创建 Worker
const blob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(blob);

/**
 * 使用 Web Worker 生成 Excel 文件
 * @param rowData - 表格数据行
 * @param headers - 表头数组
 * @param onProgress - 进度回调函数
 * @returns Promise<Uint8Array> - Excel 文件数据
 */
export async function generateExcelBuffer(
  rowData: ExcelRow[],
  headers: string[],
  onProgress?: (progress: ExportProgress) => void,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerUrl);
    
    worker.addEventListener('message', (e: MessageEvent<ExportMessage>) => {
      const message = e.data;

      switch (message.type) {
        case 'progress':
          onProgress?.(message);
          break;
        case 'complete':
          worker.terminate();
          resolve(message.buffer);
          break;
        case 'error':
          worker.terminate();
          reject(new Error(message.error));
          break;
      }
    });

    worker.addEventListener('error', (error) => {
      worker.terminate();
      reject(error);
    });

    worker.postMessage({ rowData, headers, batchSize: 50000 });
  });
}
