import requests
import json
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
from datetime import datetime
from bs4 import BeautifulSoup
def getSentiment(startDate, endDate):
    maxDate = endDate.split('-')
    maxDate = datetime(int(maxDate[0]),int(maxDate[1]), int(maxDate[2]))
    minDate = startDate.split('-')
    minDate = datetime(int(minDate[0]),int(minDate[1]), int(minDate[2]))

    maxComp = {'compound':-2}
    minComp = {'compound':2}

    apiKey = 'OmIwMThkMTA2NDQ2MzY5ZGJiOGRiMzM4NDE1OTYwMzZj'
    companySymbol = 'AAPL'

    r = requests.get(f'https://api-v2.intrinio.com/companies/{companySymbol}/news?api_key={apiKey}')

    newJson = {}
    newJson['res'] = []
    flag = True
    
    nltk.download('vader_lexicon')
    sia = SentimentIntensityAnalyzer()
    avgComp = 0
    while (r!=None):
        for x in r.json()['news']:
            pubDate = x['publication_date'][:10].split('-')
            pubDate = datetime(int(pubDate[0]),int(pubDate[1]), int(pubDate[2]))
            if (pubDate<minDate):
                flag = False
                break
            if (pubDate<=maxDate and len(x['summary'].split('.'))<10):
                nv = sia.polarity_scores(x['summary'])
                toAdd = {'title': x['title'], 'date': pubDate, 'summary': x['summary'], 'positive': nv['pos'], 'neutral': nv['neu'], 'negative': nv['neg'], 'compound': nv['compound']}
                newJson['res']+=[toAdd]
                if (toAdd['compound'] > maxComp['compound']):
                    toAdd['url'] = x['url']
                    maxComp = toAdd
                if (toAdd['compound'] < minComp['compound']):
                    toAdd['url'] = x['url']
                    minComp = toAdd
                avgComp += nv['compound']

        print('.')
        if not flag:
            break
        r = requests.get(f'https://api-v2.intrinio.com/companies/{companySymbol}/news?api_key={apiKey}&next_page={r.json()["next_page"]}')
    newJson['maxSentiment'] = maxComp
    newJson['minSentiment'] = minComp
    newJson['averageSentiment'] = avgComp/len(newJson['res'])
    newJson['maxImg'] = ''
    newJson['minImg'] = ''
    for imgs in [(0,maxComp['url']), (1,minComp['url'])]:
        r = requests.get(imgs[1])
        soup = BeautifulSoup(r.text, 'html.parser')
        eles = soup.find_all('div')
        for x in eles:
            if x.has_attr('id') and x['id'] == 'Main':
                for y in x.find_all('img'):
                    if 'spaceball' not in y['src']:
                        if (imgs[0] == 0):
                            newJson['maxImg'] = y['src']
                        else:
                            newJson['minImg'] = y['src']
                        break
                break
    return newJson

ret = getSentiment('2019-09-20','2019-11-04')
    