import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { pdfDb } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import { Collapse, Space } from 'antd';
import { Button } from 'antd';
import { axiosInstance } from '../utils/api';
import { toSentenceCase } from '../utils/common';
import rehypeRaw from 'rehype-raw';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { AnimatedLoader } from './AnimatedLoader';
import { Markdown } from 'react-markdown';
import { ToastContainer } from 'react-toastify';

// Set the workerSrc for pdfjs
// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFReader = () => {
  const [numPages, setNumPages] = useState(null);
  const [currPage, setCurrPage] = useState(0);
  const [error, setError] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pdfUrl] = useState(
    'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
  );

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error) => {
    console.error('Failed to load PDF:', error);
    setError('Failed to load PDF. Please check the URL and try again.');
  };

  const processPDF = async (downloadURL) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/process_pdf', {
        pdf_url: downloadURL,
      });
      console.log(response?.data?.results);
      setContent(response?.data?.results);
    } catch (error) {
      console.error('API call failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContent = (key, value) => {
    switch (key) {
      case 'violations':
        return (
          <ol>
            {value.map((listItem) => (
              <li className="error-text">{listItem}</li>
            ))}
          </ol>
        );
      case 'suggestions':
        return (
          <ol>
            {value.map((listItem) => (
              <li>{listItem}</li>
            ))}
          </ol>
        );
      case 'updatedContent':
        return (
          <div>
            <Markdown rehypePlugins={[rehypeRaw]}>{value}</Markdown>
          </div>
        );
    }
  };

  const getHeader = (key) => {
    const text = <span className="sentence-case">{toSentenceCase(key)}</span>;
    switch (key) {
      case 'violations':
        return <span>{text} 🚫</span>;
      case 'suggestions':
        return <span>{text} ❗</span>;
      case 'updatedContent':
        return <span>Edited Content ✅</span>;
    }
  };

  const handleUpload = async () => {
    if (pdf) {
      setUploading(true);
      try {
        const pdfRef = ref(pdfDb, `files/${v4()}`);
        const snapshot = await uploadBytes(pdfRef, pdf);
        const downloadURL = await getDownloadURL(snapshot.ref);
        setUploading(false);
        processPDF(downloadURL);
      } catch (error) {
        console.error('Upload failed:', error);
        setUploading(false);
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        height: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          height: '100%',
          maxHeight: '80vh',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px',
            overflowY: 'auto',
            background: '#fff',
            minHeight: '10vh',
          }}
        >
          <input
            type="file"
            onChange={(e) => {
              setPdf(e.target.files[0]);
              console.log(e.target.files[0]);
            }}
          />
          {uploading ? (
            <p>processing...</p>
          ) : (
            <Button type="primary" onClick={handleUpload}>
              Process
            </Button>
          )}
        </div>
        <div
          style={{
            marginTop: '1px',
            padding: '10px',
            overflowY: 'auto',
            background: '#fff',
          }}
        >
          <Document
            file={pdf}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
          </Document>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: '10px',
          background: '#f0f0f0',
          overflowY: 'auto',
          color: 'black',
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p>Page</p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Button
                disabled={currPage == '0'}
                onClick={() => setCurrPage((state) => state - 1)}
              >
                {'<'}
              </Button>
              {currPage}
              <Button
                disabled={currPage == numPages - 1}
                onClick={() => setCurrPage((state) => state + 1)}
              >
                {'>'}
              </Button>
            </div>
          </div>
          {content.length > 0 &&
            Object.entries(content[currPage])?.map(([key, value]) => {
              return (
                <>
                  <Collapse
                    collapsible="header"
                    defaultActiveKey={['1']}
                    items={[
                      {
                        key: '1',
                        label: getHeader(key),
                        children: getContent(key, value),
                      },
                    ]}
                  />
                </>
              );
            })}
        </Space>
      </div>
      <style jsx global>{`
        .ql-editor {
          color: black; /* Ensure the text color is black */
        }
      `}</style>
      {loading && <AnimatedLoader />}
    </div>
  );
};

export default PDFReader;
