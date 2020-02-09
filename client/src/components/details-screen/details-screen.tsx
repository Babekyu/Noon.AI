import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  Card,
  Row,
  Col,
  DatePicker,
  Typography,
  BackTop,
  Collapse
} from 'antd';

import {
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
import DataSet from '@antv/data-set';

import moment from 'moment';

import './details-screen.css';

const { RangePicker } = DatePicker;
const { Text, Paragraph, Title } = Typography;
const { Meta } = Card;
const { Panel } = Collapse;

interface IParam {
  symbol: string;
}

interface ISentiment {
  title: string;
  negative: number;
  positive: number;
  neutral: number;
}

const data = [
  {
    year: '1991',
    value: 3
  },
  {
    year: '1992',
    value: 4
  },
  {
    year: '1993',
    value: 3.5
  },
  {
    year: '1994',
    value: 5
  },
  {
    year: '1995',
    value: 4.9
  },
  {
    year: '1996',
    value: 6
  },
  {
    year: '1997',
    value: 7
  },
  {
    year: '1998',
    value: 9
  },
  {
    year: '1999',
    value: 13
  }
];

const cols = {
  value: {
    min: 0
  },
  year: {
    range: [0, 1]
  }
};

const overallSentiment = [
  {
    title: 'Sentiment',
    negative: 25635,
    positive: 1890,
    neutral: 9314,
  },
];

const tabList = [
  {
    key: '1day',
    tab: '1 Day'
  },
  {
    key: '5days',
    tab: '5 Days'
  },
  {
    key: '1month',
    tab: '1 Month'
  },
  {
    key: '6months',
    tab: '6 Months'
  },
  {
    key: '1year',
    tab: '1 Year'
  },
  {
    key: '5years',
    tab: '5 Years'
  },
  {
    key: 'max',
    tab: 'Max'
  }
];

const dateFormat = 'YYYY-MM-DD';

const buildSentimentDV = (sentimentData: ISentiment[]) => {
  const ds = new DataSet();
  const dv = ds.createView().source(sentimentData);
  dv.transform({
    type: 'fold',
    fields: ['negative', 'neutral', 'positive'],
    key: 'Sentiment',
    value: 'Percentage',
    retains: ['title'],
  });
  return dv;
};

const SymbolScreen = () => {
  const s = useParams<IParam>().symbol;
  const [meta, setMeta] = useState<any>();
  const [symbol, setSymbol] = useState<string>(s);
  return (
    <div className="symbol-details">
      <BackTop />
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
              <Chart
                padding={20}
                height={400}
                data={data}
                scale={cols}
                forceFit
              >
                <Axis name="year" />
                <Axis name="value" />
                <Tooltip
                  crosshairs={{
                    type: 'y',
                  }}
                />
                <Geom type="line" position="year*value" size={2} />
                <Geom
                  type="point"
                  position="year*value"
                  size={4}
                  shape="circle"
                  style={{
                    stroke: '#fff',
                    lineWidth: 1,
                  }}
                />
              </Chart>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={10} lg={10} xl={10}>
            <Card title="Media Sentiment Analysis" className="mb-3">
              <div className="picker-container mb-3">
                <Paragraph type="secondary" className="mb-1 fw-200">
                  Analysis Date Range
                </Paragraph>
                <RangePicker
                  format={dateFormat}
                  defaultValue={[moment().subtract(1, 'month'), moment()]}
                />
              </div>
              <Paragraph type="secondary" className="mb-1 fw-200">
                Overview
              </Paragraph>
              <Card
                // loading
                className="mb-1"
              >
                <Paragraph type="secondary" className="mb-1">
                  Overall Sentiment
                </Paragraph>
                <Chart
                  height={100}
                  data={buildSentimentDV(overallSentiment)}
                  padding={[10, 10, 50, 10]}
                  forceFit
                >
                  <Legend />
                  <Coord transpose />
                  <Tooltip />
                  <Geom
                    type="intervalStack"
                    position="Title*Percentage"
                    color={['Sentiment', ['#f44336', '#9E9E9E', '#4CAF50']]}
                  />
                </Chart>
              </Card>
              <Paragraph type="secondary" className="mb-1 fw-200">
                Articles Found
              </Paragraph>
              <Card
                // loading
                className="mb-1"
                hoverable
              >
                <Title level={4}>Article Title</Title>
                <Paragraph copyable>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Vivamus sagittis felis leo, eu varius ex placerat at.
                  Curabitur vel dui blandit, imperdiet est nec, aliquam enim.
                  Vestibulum placerat dolor turpis, vel blandit enim interdum
                  sit amet. Cras hendrerit quis est eget porttitor.
                </Paragraph>
                <Meta description="Bloomberg | Dec 2nd 2020" />
              </Card>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SymbolScreen;
