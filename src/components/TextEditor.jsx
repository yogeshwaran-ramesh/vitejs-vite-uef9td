// TextEditor.js
import React, { useState, useRef, useCallback } from 'react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import debounce from 'lodash/debounce';
import { axiosInstance } from '../utils/api';
import { Collapse, Space } from 'antd';
import { toSentenceCase } from '../utils/common';
import { Markdown } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { toast } from 'react-toastify';

const TextEditor = () => {
  const [editorContent, setEditorContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState({});
  const quillRef = useRef(null);

  const handleChange = (content) => {
    setEditorContent(content);
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const text = editor.getText();
      debouncedApiCall(text);
    }
  };

  const callApi = async (text) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/process_text', {
        content: text,
      });
      console.log(response?.data);
      setContent(response?.data?.results);
      toast('Text Reviewed');
    } catch (error) {
      console.error('API call failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedApiCall = useCallback(debounce(callApi, 2000), []);

  const modules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }, { font: [] }],
      [{ size: [] }],
      [{ align: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' },
      ],
      ['link', 'image', 'video'],
      [{ color: [] }, { background: [] }], // Dropdown with defaults from theme
      ['clean'], // Remove formatting button
    ],
  };

  const getContent = (key, value) => {
    console.log(key);
    console.log(value);
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
          flex: 1,
          padding: '10px',
          overflowY: 'auto',
          background: '#fff',
        }}
      >
        <ReactQuill
          theme="snow"
          value={editorContent}
          onChange={handleChange}
          modules={modules}
          style={{ height: 'calc(100vh - 20px)' }}
          ref={quillRef}
        />
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
          {Object.entries(content).map(([key, value]) => {
            console.log(key);
            console.log(value);
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
    </div>
  );
};

export default TextEditor;
