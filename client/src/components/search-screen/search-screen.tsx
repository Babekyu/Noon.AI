
import React, { useState, useEffect } from 'react';

import {
  AutoComplete,
  Typography,
  Input,
  Button,
  Icon,
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

import { SelectValue } from 'antd/lib/select';
import axios, { AxiosResponse } from 'axios';
import { useHistory } from 'react-router-dom';

import urls from '../../helpers/urls';

import './search-screen.css';


const { Text } = Typography;

interface AlphaVantageSuggestionResp {
  bestMatches: ISymbolSuggestionData[];
}

interface ISymbolSuggestionData {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
}

interface ISymbolSuggestion {
  symbol: string;
  name: string;
  type: string;
}

const fetchSuggestionData = async (query: string) => {
  const resp:
    AxiosResponse<AlphaVantageSuggestionResp> = await axios
      .get(urls.stock_symbol_suggestions(query));
  if (!resp || !resp.data || !resp.data.bestMatches) {
    return [];
  }
  return resp.data.bestMatches.map<ISymbolSuggestion>((v) => ({
    symbol: v['1. symbol'],
    name: v['2. name'],
    type: v['3. type'],
  }));
};

const ChatScreen: React.FC = () => {
  const [query, setQuery] = useState<string>();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [symbol, setSymbol] = useState<string>();
  const history = useHistory();

  const onSearchType = (q: string) => {
    setQuery(q);
  };

  const onSelectOption = (value: SelectValue) => {
    const symb = value.toString().split(': ')[0];
    setSymbol(symb);
    history.push(`/symbol/${symb}`);
  };

  useEffect(() => {
    async function doAsync() {
      if (!!query && query !== '') {
        const suggestionsRaw = await fetchSuggestionData(query);
        setSuggestions(suggestionsRaw.map((s) => `${s.symbol}: ${s.name} - ${s.type}`));
      }
    }
    doAsync();
  }, [query]);

  const onClickSearch = () => {
    setSymbol(query);
    history.push(`/symbol/${query}`);
  };

  return (
    <div className="search-screen">
      <div className="search-screen-elements">
        <div className="title-container">
          <h1>Noon.ai</h1>
          <Text type="secondary">Artificial Inteligence Powered Financial Advisor</Text>
        </div>
        <div className="search-bar-container">
          <AutoComplete
            size="large"
            className="fluid"
            placeholder="Search Stock Symbol (i.e. APPL)"
            onSearch={onSearchType}
            onSelect={onSelectOption}
            dataSource={suggestions}
          >
            <Input
              suffix={(
                <Button
                  className="search-btn"
                  style={{ marginRight: -12 }}
                  size="large"
                  type="primary"
                  onClick={onClickSearch}
                >
                  <Icon type="search" />
                </Button>
              )}
            />
          </AutoComplete>
        </div>
      </div>
    </div>
  );
};


export default ChatScreen;
