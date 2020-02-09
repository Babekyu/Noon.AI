import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
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
  notification,
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
import { ISentimentData, IGraphData } from '../../App';

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
  history: IGraphData | undefined,
  future: IGraphData | undefined,
  onDateUpdated: () => void,
}

interface ISentiment {
  title: string;
  negative: number;
  positive: number;
}

interface IDateRange {
  start: string;
  end: string;
}


const cols = {
  value: {
    min: 0,
  },
  year: {
    range: [0, 1],
  },
};

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
    fields: ['negative', 'positive'],
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
    .filter((s) => s.compound > 0)
    .length : 0;

  const negativeSum = sentiments && sentiments.res ? sentiments
    .res
    .filter((s) => s.compound < 0)
    .length : 0;

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
                color={['Sentiment', ['#f44336', '#4CAF50']]}
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
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              key={s.id}
            >
              <Card
                className="mb-1"
                hoverable
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

const parseData = (rawData: IGraphData | undefined, label: string) => {
  if (!rawData) {
    return [];
  }
  const { data } = rawData;
  const resolution: {date: string, value: number, label: string}[] = [];
  Object.keys(data.ds).forEach(
    (key) => {
      const date = data.ds[key];
      const value = Number(data.y[key]);
      resolution.push({
        date,
        value,
        label,
      });
    },
  );
  return resolution;
};

const buildStockPriceDV = (
  history: IGraphData | undefined,
  future: IGraphData | undefined,
  filter: string
) => {
  const hData = parseData(history, 'history');
  const fData = parseData(future, 'future');
  if (fData.length === 0) {
    return hData;
  }
  const raw = [...hData, ...fData];
  let filtered;
  switch (filter) {
    case '6months':
      filtered = raw.filter((r) => moment(r.date).isSameOrBefore(moment().subtract(6, 'month')));
      break;
    case 'max':
    default:
      filtered = raw;
  }
  return filtered;
};

const pageLoader = (
  symbol: string,
  meta: ISymbolSuggestion | undefined,
  sentiments: ISentimentData | undefined,
  history: IGraphData | undefined,
  future: IGraphData | undefined,
  filter: string,
  handleDate: (dates: RangePickerValue, dateStrings: [string, string]) => void,
) => {
  if (!meta) {
    return <Spin size="large" />;
  }
  const data = buildStockPriceDV(history, future, filter);
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
            {history ? (
              <Card
                hoverable
                title="Market Trends"
                className="mb-3"
                tabList={tabList}
                onTabChange={(key) => {}}
              >
                <Chart
                  padding={[40, 30, 80, 30]}
                  height={400}
                  data={data}
                  scale={cols}
                  forceFit
                >
                  <Legend />
                  <Axis name="date" />
                  <Axis name="value" />
                  <Tooltip
                    crosshairs={false}
                    useHtml
                    enterable
                  />
                  <Geom
                    type="area"
                    position="date*value"
                    size={2}
                    shape="smooth"
                    color={['label', ['#009688', '#F48FB1']]}
                  />
                </Chart>
              </Card>
            ) : (
              <Card
                loading
                title="Market Trends"
              >
                <Meta
                  title="Card title"
                  description="This is the description"
                />
              </Card>
            )}
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

const SymbolScreen = ({
  connected,
  sentiment,
  history,
  future,
  onDateUpdated,
}: Props) => {
  const s = useParams<IParam>().symbol;
  const h = useHistory();
  const [symbol, setSymbol] = useState<string>(s);
  const [meta, setMeta] = useState<ISymbolSuggestion>();
  const [displaySentiments, setDisplaySentiments] = useState<boolean>();
  const [filter, setFilter] = useState<string>('max');
  const [dateRange, setDate] = useState<IDateRange>({
    start: moment().subtract(1, 'month').format(dateFormat),
    end: moment().format(dateFormat),
  });

  const handleDatePicker = (_: RangePickerValue, dateStrings: [string, string]) => {
    setDisplaySentiments(false);
    onDateUpdated();
    setDate({
      start: dateStrings[0],
      end: dateStrings[1],
    });
  };

  useEffect(() => {
    if (connected) {
      const message = new Paho.Message(JSON.stringify({
        start: dateRange.start,
        end: dateRange.end,
        ticker: symbol,
      }));
      message.destinationName = 'getSentiment';
      messaging.send(message);
      setDisplaySentiments(true);
    }
  }, [dateRange]);

  useEffect(() => {
    if (connected) {
      const sMessage = new Paho.Message(JSON.stringify({
        start: moment().subtract(1, 'month').format(dateFormat),
        end: moment().format(dateFormat),
        ticker: symbol,
      }));
      const hMessage = new Paho.Message(symbol);
      const fMessage = new Paho.Message(symbol);
      sMessage.destinationName = 'getSentiment';
      hMessage.destinationName = 'getHistory';
      fMessage.destinationName = 'getFuture';
      messaging.send(sMessage);
      messaging.send(hMessage);
      messaging.send(fMessage);
      setDisplaySentiments(true);
    }
  }, [meta]);

  useEffect(() => {
    async function doAsync() {
      const res = await fetchSuggestionData(symbol);
      const symbolRes = res.find((r) => r.symbol === symbol);
      if (symbolRes) {
        setMeta(symbolRes);
      } else {
        h.push('/');
        notification.open({
          message: `${symbol} is Not a Valid Symbol`,
          description: 'Taking You Back to Home Page Now',
        });
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
        history,
        future,
        filter,
        handleDatePicker,
      )}
    </div>
  );
};

export default SymbolScreen;
