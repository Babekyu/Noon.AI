const urls = {
  stock_symbol_suggestions: (query: string | null) => `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=42LEY678PNPKB6OK`,
};

export default urls;
