import React from 'react';
import TextEditor from './components/TextEditor';
import PDFReader from './components/PDFReader';
import { Tabs, ConfigProvider, Layout } from 'antd';
import './App.css';

const { Header } = Layout;

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#ff4d00',
          borderRadius: 2,
          colorBgContainer: 'white',
        },
      }}
    >
      <Layout>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: 'white' }}>Doc (AI)ditor</span>
        </Header>
        <div className="App">
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                label: 'Text',
                key: '1',
                children: <TextEditor />,
              },
              {
                label: 'File',
                key: '2',
                children: <PDFReader />,
              },
            ]}
          />
        </div>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
