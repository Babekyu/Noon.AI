
import React, { useState, useEffect } from 'react';

import { AutoComplete, Typography } from 'antd';
import axios, { AxiosResponse } from 'axios';
import urls from '../../helpers/urls';

import './search-screen.css';
import { SelectValue } from 'antd/lib/select';

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
  return resp.data.bestMatches.map<ISymbolSuggestion>((v) => ({
    symbol: v['1. symbol'],
    name: v['2. name'],
    type: v['3. type'],
  }));
};

const ChatScreen: React.FC = () => {
  const [query, setQuery] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const onSearchType = (q: string) => {
    setQuery(q);
  };

  const onSelectOption = (value: SelectValue) => {
    const v = value.toString();
    console.log(v.split(': '));
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
          />
        </div>
      </div>
    </div>
  );
};


export default ChatScreen;
