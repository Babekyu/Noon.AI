import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Paho from 'paho-mqtt';

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
  Tag,
} from 'antd';

import {
  Chart,
  Geom,
  Axis,
  Tooltip,
  Coord,
  Legend,
  Guide,
} from 'bizcharts';
import { RangePickerValue } from 'antd/lib/date-picker/interface';

import DataSet from '@antv/data-set';
import moment from 'moment';
import messaging from '../../helpers/messaging';

import { ISymbolSuggestion, fetchSuggestionData } from '../../services/search-symbol';

import './details-screen.css';
import { ISentimentData } from '../../App';

const { RangePicker } = DatePicker;
const { Text, Paragraph, Title } = Typography;
const { Meta } = Card;
const { Panel } = Collapse;
const { Line } = Guide;

interface IParam {
  symbol: string;
}

type Props = {
  connected: boolean;
  sentiment: ISentimentData | undefined;
}

interface ISentiment {
  title: string;
  negative: number;
  positive: number;
  neutral: number;
}

interface IDateRange {
  start: string;
  end: string;
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

const buildTag = (compond: number) => (
  <Tag color={compond > 0 ? '#43A047' : '#e53935'}>{compond > 0 ? 'Positive' : 'Negative'}</Tag>
);

const mediaBuilder = (
  sentiments: ISentimentData | undefined,
  handleDate: (dates: RangePickerValue, dateStrings: [string, string]) => void,
) => {
  const positiveSum = sentiments && sentiments.res ? sentiments
    .res
    .map((s) => s.positive).reduce((a, b) => a + b, 0) : 0;

  const negativeSum = sentiments && sentiments.res ? sentiments
    .res
    .map((s) => s.negative).reduce((a, b) => a + b, 0) : 0;

  const neutralSum = sentiments && sentiments.res ? sentiments
    .res
    .map((s) => s.neutral).reduce((a, b) => a + b, 0) : 0;
  return (
    <Card title="Media Sentiment Analysis" className="mb-3">
      <div className="picker-container mb-3">
        <Paragraph type="secondary" className="mb-1 fw-200">
          Analysis Date Range
        </Paragraph>
        <RangePicker
          format={dateFormat}
          defaultValue={[moment().subtract(1, 'month'), moment()]}
          onChange={handleDate}
          disabled={!sentiments}
        />
      </div>
      {(sentiments) ? (
        <div>
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
              data={buildSentimentDV([{
                title: 'Sentiment',
                positive: positiveSum,
                negative: negativeSum,
                neutral: neutralSum,
              }])}
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
            Most Positive
          </Paragraph>
          <a href={sentiments.maxSentiment.url} target="_blank" rel="noopener noreferrer">
            <Card
              className="mb-1"
              hoverable
            >
              <Title level={4}>
                {sentiments.maxSentiment.title}
              </Title>
              <Paragraph copyable>
                {sentiments.maxSentiment.summary}
              </Paragraph>
              <Meta description={moment(sentiments.maxSentiment.date).format('LL')} />
            </Card>
          </a>
          <Paragraph type="secondary" className="mb-1 fw-200">
            Most Negative
          </Paragraph>
          <a href={sentiments.minSentiment.url} target="_blank" rel="noopener noreferrer">
            <Card
              className="mb-1"
              hoverable
            >
              <Title level={4}>
                {sentiments.minSentiment.title}
              </Title>
              <Paragraph copyable>
                {sentiments.minSentiment.summary}
              </Paragraph>
              <Meta description={moment(sentiments.minSentiment.date).format('LL')} />
            </Card>
          </a>
          <Paragraph type="secondary" className="mb-1 fw-200">
            All Articles Found
          </Paragraph>
          {sentiments.res.map((s, i) => (
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              <Card
                className="mb-1"
                hoverable
                key={i}
              >
                <Title level={4}>
                  {s.title}
                </Title>
                {buildTag(s.compound)}
                <Paragraph copyable>
                  {s.summary}
                </Paragraph>
                <Meta description={moment(s.date).format('LL')} />
              </Card>
            </a>
          ))}
        </div>
      ) : (
        <div>
          <Card loading className="mb-1">
            <Meta
              title="Card title"
              description="This is the description"
            />
          </Card>
          <Card loading className="mb-1">
            <Meta
              title="Card title"
              description="This is the description"
            />
          </Card>
          <Card loading className="mb-1">
            <Meta
              title="Card title"
              description="This is the description"
            />
          </Card>
        </div>
      )}
    </Card>
  );
};

const pageLoader = (
  symbol: string,
  meta: ISymbolSuggestion | undefined,
  sentiments: ISentimentData | undefined,
  handleDate: (dates: RangePickerValue, dateStrings: [string, string]) => void,
) => {
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
            {mediaBuilder(sentiments, handleDate)}
          </Col>
        </Row>
      </div>
    </div>
  );
};

const isLoading = (meta: ISymbolSuggestion | undefined) => (
  !meta ? 'full-screen-center' : ''
);

const SymbolScreen = ({ connected, sentiment }: Props) => {
  const s = useParams<IParam>().symbol;
  const [symbol, setSymbol] = useState<string>(s);
  const [meta, setMeta] = useState<ISymbolSuggestion>();
  const [displaySentiments, setDisplaySentiments] = useState<boolean>();
  const [dateRange, setDate] = useState<IDateRange>({
    start: moment().subtract(1, 'month').format(dateFormat),
    end: moment().format(dateFormat),
  });

  const handleDatePicker = (_: RangePickerValue, dateStrings: [string, string]) => {
    setDisplaySentiments(false);
    setDate({
      start: dateStrings[0],
      end: dateStrings[1],
    });
  };

  useEffect(() => {
    if (connected) {
      const message = new Paho.Message(JSON.stringify({
        start: moment().subtract(1, 'month').format(dateFormat),
        end: moment().format(dateFormat),
        ticker: symbol,
      }));
      message.destinationName = 'getSentiment';
      messaging.send(message);
      setDisplaySentiments(true);
    }
  }, [meta, connected, dateRange]);

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
    <div className={`symbol-details ${isLoading(meta)}`}>
      <BackTop />
      {pageLoader(
        symbol,
        meta,
        displaySentiments ? sentiment : undefined,
        handleDatePicker,
      )}
    </div>
  );
};

export default SymbolScreen;
