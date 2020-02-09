import pandas as pd
import numpy as np
from fbprophet import Prophet
from functools import reduce
import json
import requests

key = "B78G6DDCEH4QUIAO"
# pip install holidays==0.9.12 to deal with easter issue

def getFuture(symbol):
    # symbol = 'APPLX'
    r = requests.get('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+symbol+
                     '&outputsize=full&apikey='+key)
    p = r.json()['Time Series (Daily)']
    df = pd.DataFrame.from_dict(p).T
    df.index = pd.to_datetime(df.index)
    df = df[['4. close']]
    df['date'] = df.index
    df.index = [x for x in range(len(df))]
    df.columns = ['y', 'ds']
    model = Prophet()
    model.fit(df)
    future = model.make_future_dataframe(30, freq='d')

    future_boolean = future['ds'].map(lambda x: True if x.weekday() in range(0, 5) else False)
    future = future[future_boolean]
    forecast = model.predict(future)
    forecast = forecast[['yhat', 'yhat_lower', 'yhat_upper']]
    forecast['ds'] = future['ds'].to_list()
    forecast = forecast[len(df):]
    forecast.index = [x for x in range(len(forecast))]

    forecast['ds'] = forecast['ds'].dt.strftime('%Y-%m-%d')
    future_data = forecast.to_json()
    future_data = json.loads(future_data)

    response = {
        "data": future_data
    }
    return response

def getHistorical(symbol):
    r = requests.get('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + symbol +
                     '&outputsize=full&apikey=' + key)
    p = r.json()['Time Series (Daily)']
    df = pd.DataFrame.from_dict(p).T
    df.index = pd.to_datetime(df.index)
    df = df[['4. close']]
    df['date'] = df.index
    df.index = [x for x in range(len(df))]
    df.columns = ['y', 'ds']
    df['ds'] = df['ds'].dt.strftime('%Y-%m-%d')
    historical_data = df.to_json()
    historical_data = json.loads(historical_data)
    response = {
        "data": historical_data
    }
    return response

# Uottahack3