import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {
  Card,
  Row,
  Col,
  DatePicker,
  Typography,
  BackTop,
  Collapse,
  Spin,
  Descriptions,
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
import { ISymbolSuggestion, fetchSuggestionData } from '../../services/search-symbol';

const { RangePicker } = DatePicker;
const { Text, Paragraph, Title } = Typography;
const { Meta } = Card;
const { Panel } = Collapse;
const { Line } = Guide;

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
    value: 3,
  },
  {
    year: '1992',
    value: 4,
  },
  {
    year: '1993',
    value: 3.5,
  },
  {
    year: '1994',
    value: 5,
  },
  {
    year: '1995',
    value: 4.9,
  },
  {
    year: '1996',
    value: 6,
  },
  {
    year: '1997',
    value: 7,
  },
  {
    year: '1998',
    value: 9,
  },
  {
    year: '1999',
    value: 13,
  },
  {
    year: '2000',
  },
  {
    year: '2001',
  },
  {
    year: '2002',
  },
  {
    year: '2003',
  },
];

const cols = {
  value: {
    min: 0,
  },
  year: {
    range: [0, 1],
  },
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
    key: 'max',
    tab: 'Max',
  },
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

const pageLoader = (symbol: string, meta: ISymbolSuggestion | undefined) => {
  if (!meta) {
    return <Spin size="large" />;
  }
  return (
    <div>
      <div className="container">
        <div className="column">
          <div className="title-container mb-3">
            <h1>{symbol}</h1>
            <h4>
              {meta.name}
            </h4>
            <Descriptions>
              <Descriptions.Item label="Currency">{meta.currency}</Descriptions.Item>
              <Descriptions.Item label="Region">{meta.region}</Descriptions.Item>
              <Descriptions.Item label="Market Open">{meta.marketOpen}</Descriptions.Item>
              <Descriptions.Item label="Market Close">{meta.marketClose}</Descriptions.Item>
              <Descriptions.Item label="Time Zone">{meta.timezone}</Descriptions.Item>
              <Descriptions.Item label="Product Type">{meta.type}</Descriptions.Item>
            </Descriptions>
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
                padding={[40, 20, 40, 20]}
                height={400}
                data={data}
                scale={cols}
                forceFit
              >
                <Axis name="year" />
                <Axis name="value" />
                <Tooltip
                  crosshairs={false}
                  useHtml
                  enterable
                  triggerOn="click"
                />
                <Geom type="area" position="year*value" size={2} shape="smooth" />
                <Guide>
                  <Line
                    top
                    start={{
                      year: '1999',
                      value: 13,
                    }}
                    end={{
                      year: '2003',
                      value: 15,
                    }}
                    lineStyle={{
                      stroke: '#E91E63',
                      lineDash: [0, 2, 2],
                      lineWidth: 1,
                    }}
                  />
                </Guide>
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

const SymbolScreen = () => {
  const s = useParams<IParam>().symbol;
  const [symbol, setSymbol] = useState<string>(s);
  const [meta, setMeta] = useState<ISymbolSuggestion>();

  useEffect(() => {
    async function doAsync() {
      const res = await fetchSuggestionData(symbol);
      const symbolRes = res.find((r) => r.symbol === symbol);
      if (symbolRes) {
        setMeta(symbolRes);
      }
    }
    doAsync();
  }, [symbol]);
  return (
    <div className="symbol-details">
      <BackTop />
      {pageLoader(symbol, meta)}
    </div>
  );
};

export default SymbolScreen;
