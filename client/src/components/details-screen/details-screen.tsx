import React, { useState } from 'react';
import {
  useParams,
} from 'react-router-dom';

import {
  Card, Row, Col,
} from 'antd';

import {
  G2,
  Chart,
  Geom,
  Axis,
  Tooltip,
  Coord,
  Label,
  Legend,
  View,
  Guide,
  Shape,
  Facet,
  Util,
} from 'bizcharts';

import './details-screen.css';

interface IParam {
  symbol: string;
}

const tabList = [
  {
    key: '1day',
    tab: '1 Day',
  },
  {
    key: '5days',
    tab: '5 Days',
  },
  {
    key: '1month',
    tab: '1 Month',
  },
  {
    key: '6months',
    tab: '6 Months',
  },
  {
    key: '1year',
    tab: '1 Year',
  },
  {
    key: '5years',
    tab: '5 Years',
  },
  {
    key: 'max',
    tab: 'Max',
  },
];

const SymbolScreen = () => {
  const s = useParams<IParam>().symbol;
  const [symbol, setSymbol] = useState<string>(s);
  return (
    <div className="symbol-details">
      <div className="container">
        <div className="column">
          <div className="title-container mb-3">
            <h1>{symbol}</h1>
            <h4>Apple Inc.</h4>
          </div>
        </div>
      </div>
      <div className="container">
        <Row gutter={16}>
          <Col xs={24} sm={24} md={14} lg={14} xl={14} className="mb-3">
            <Card
              hoverable
              title="Market Trends"
              className="mb-3"
              tabList={tabList}
            >
              <p>Context</p>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={10} lg={10} xl={10}>
            <Card
              hoverable
              title="News Articles Analysis"
              className="mb-3"
            >
              <p>Context</p>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SymbolScreen;
