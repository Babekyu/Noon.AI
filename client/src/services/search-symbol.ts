import axios, { AxiosResponse } from 'axios';
import urls from '../helpers/urls';

export interface AlphaVantageSuggestionResp {
  bestMatches: ISymbolSuggestionData[];
}

export interface ISymbolSuggestionData {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}

export interface ISymbolSuggestion {
  symbol: string;
  name: string;
  type: string;
  region: string;
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
  matchScore: string
}

export const fetchSuggestionData = async (query: string) => {
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
    currency: v['8. currency'],
    marketClose: v['6. marketClose'],
    marketOpen: v['5. marketOpen'],
    matchScore: v['9. matchScore'],
    region: v['4. region'],
    timezone: v['7. timezone'],
  }));
};
