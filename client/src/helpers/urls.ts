const urls = {
  stock_symbol_suggestions: (query: string | null) => `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=B78G6DDCEH4QUIAO`,
};

export default urls;
