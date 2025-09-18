import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Copy, Download, File, Image } from 'lucide-react';
import * as mammoth from 'mammoth';

function TextExtractionComponent() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [fileType, setFileType] = useState(null);

  const supportedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'],
    pdf: ['application/pdf'],
    docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    doc: ['application/msword']
  };

  const getFileType = (file) => {
    if (supportedTypes.image.includes(file.type)) return 'image';
    if (supportedTypes.pdf.includes(file.type)) return 'pdf';
    if (supportedTypes.docx.includes(file.type)) return 'docx';
    if (supportedTypes.doc.includes(file.type)) return 'doc';
    return 'unsupported';
  };

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const type = getFileType(selectedFile);
    
    if (type === 'unsupported') {
      setError('Unsupported file type. Please select an image, PDF, or DOCX file.');
      return;
    }

    // Validate file size (max 25MB for PDFs/DOCX, 10MB for images)
    const maxSize = type === 'image' ? 10 * 1024 * 1024 : 25 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(`File size should be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    setFile(selectedFile);
    setFileType(type);
    setText('');
    setError(null);
    setProgress(0);

    // Create preview for images
    if (type === 'image') {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  }, []);

  const extractTextFromPDF = async (pdfFile) => {
    try {
      // Read file as array buffer
      const arrayBuffer = await pdfFile.arrayBuffer();
      
      // Simple PDF text extraction (basic implementation)
      // For production, you'd want to use a more robust PDF parser
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const result = reader.result;
            // This is a very basic PDF text extraction
            // In a real app, you'd use pdf-parse or similar library
            let extractedText = '';
            
            // Convert ArrayBuffer to string for basic text search
            const uint8Array = new Uint8Array(arrayBuffer);
            let str = '';
            for (let i = 0; i < uint8Array.length; i++) {
              str += String.fromCharCode(uint8Array[i]);
            }
            
            // Look for text between common PDF text markers
            const textRegex = /BT\s*(.*?)\s*ET/gs;
            const matches = str.match(textRegex);
            
            if (matches) {
              matches.forEach(match => {
                // Clean up the text
                const cleaned = match
                  .replace(/BT|ET/g, '')
                  .replace(/\/\w+\s+\d+\s+Tf/g, '')
                  .replace(/\d+(\.\d+)?\s+\d+(\.\d+)?\s+Td/g, ' ')
                  .replace(/\((.*?)\)/g, '$1')
                  .replace(/\s+/g, ' ')
                  .trim();
                if (cleaned) extractedText += cleaned + ' ';
              });
            }
            
            if (!extractedText.trim()) {
              reject(new Error('No text found in PDF. This might be a scanned PDF that requires OCR.'));
            } else {
              resolve(extractedText.trim());
            }
          } catch (err) {
            reject(new Error('Failed to parse PDF content'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read PDF file'));
        reader.readAsText(new Blob([arrayBuffer], { type: 'text/plain' }));
      });
      
      return text;
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  };

  const extractTextFromDOCX = async (docxFile) => {
    try {
      const arrayBuffer = await docxFile.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (result.value && result.value.trim()) {
        return result.value.trim();
      } else {
        throw new Error('No text found in the document');
      }
    } catch (error) {
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
  };

  const extractTextFromImage = async (imageFile) => {
    try {
      // Dynamic import to handle potential loading issues
      const Tesseract = await import('tesseract.js');
      
      const result = await Tesseract.recognize(
        imageFile,
        'eng',
        {
          logger: (m) => {
            console.log(m);
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      if (result && result.data && result.data.text) {
        return result.data.text.trim();
      } else {
        throw new Error('No text could be extracted from the image');
      }
    } catch (error) {
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  };

  const handleTextExtraction = useCallback(async () => {
    if (!file || !fileType) {
      setError('Please select a file first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setText('');

    try {
      let extractedText = '';

      switch (fileType) {
        case 'image':
          extractedText = await extractTextFromImage(file);
          break;
        case 'pdf':
          setProgress(50);
          extractedText = await extractTextFromPDF(file);
          setProgress(100);
          break;
        case 'docx':
          setProgress(50);
          extractedText = await extractTextFromDOCX(file);
          setProgress(100);
          break;
        default:
          throw new Error('Unsupported file type');
      }

      if (extractedText) {
        setText(extractedText);
        setProgress(100);
      } else {
        setError('No text could be extracted from the file');
      }
    } catch (err) {
      console.error('Text Extraction Error:', err);
      setError(err.message || 'Failed to extract text from file');
    } finally {
      setIsProcessing(false);
    }
  }, [file, fileType]);

  const copyToClipboard = useCallback(async () => {
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        console.log('Text copied to clipboard');
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  }, [text]);

  const downloadText = useCallback(() => {
    if (text) {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extracted-text-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [text]);

  // Clean up object URL when component unmounts or preview changes
  React.useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="h-6 w-6 text-blue-500" />;
      case 'pdf': return <File className="h-6 w-6 text-red-500" />;
      case 'docx': return <FileText className="h-6 w-6 text-blue-600" />;
      default: return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Multi-Format Text Extraction
        </h2>
        <p className="text-gray-600">
          Extract text from images (OCR), PDFs, and Word documents
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Select File
        </label>
        <div className="relative">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.docx,.doc"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
          <div className="flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
            <div className="text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                Images, PDFs, DOCX files
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Formats */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Supported Formats:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium">Images (OCR)</p>
              <p className="text-gray-600">JPG, PNG, GIF, BMP, WebP</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <File className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium">PDF Documents</p>
              <p className="text-gray-600">Text-based PDFs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium">Word Documents</p>
              <p className="text-gray-600">DOCX format</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Selected File Preview */}
      {file && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Selected File</h3>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              {getFileIcon(fileType)}
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-600">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {fileType.toUpperCase()}
                </p>
              </div>
            </div>
            
            {/* Image Preview */}
            {preview && (
              <div className="mt-3">
                <img 
                  src={preview} 
                  alt="Selected file preview" 
                  className="max-w-full h-auto max-h-64 object-contain mx-auto border rounded"
                />
              </div>
            )}
          </div>
          
          {/* Process Button */}
          <div className="mt-4">
            <button
              onClick={handleTextExtraction}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Extract Text
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Processing {fileType}...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Extracted Text */}
      {text && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Extracted Text
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button
                onClick={downloadText}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
          <textarea
            value={text}
            readOnly
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Extracted text will appear here..."
          />
          <div className="mt-2 text-sm text-gray-500">
            Character count: {text.length} | Word count: {text.split(/\s+/).filter(word => word.length > 0).length}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Tips for best results:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Images:</strong> Use high-resolution, well-lit images with clear text</li>
          <li>• <strong>PDFs:</strong> Text-based PDFs work best (scanned PDFs may need OCR)</li>
          <li>• <strong>Word Docs:</strong> DOCX files are fully supported with formatting preserved as plain text</li>
          <li>• <strong>File Size:</strong> Keep images under 10MB and documents under 25MB</li>
        </ul>
      </div>
    </div>
  );
}

export default TextExtractionComponent;