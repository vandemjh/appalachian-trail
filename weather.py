import traceback
import requests
from requests_html import HTMLSession
import json
import time
import datetime
import os

alminac = "https://www.almanac.com/weather/history/zipcode/CODE/YEAR-MONTH-DAY"
zipcodes = [
    "30513",
    "30512",
    "30545",
    "28734",
    "28713",
    "28733",
    "37753",
    "28743",
    "37650",
    "37687",
    "37658",
    "24236",
    "24311",
    "24134",
    "24077",
    "24555",
    "22980",
    "22835",
    "25425",
    "17222",
    "17020",
    "19549",
    "18327",
    "07462",
    "10911",
    "06757",
    "06068",
    "01247",
    "05255",
    "05751",
    "03755",
    "03262",
    "03581",
    "04216",
    "04982",
    "04464",
    "04462",
]

f = open("out.json", "w")
session = HTMLSession()
result = {}
MAX_DATE = datetime.datetime(2019, 12, 31)
MIN_DATE = datetime.datetime(1969, 12, 31)
totalProgress = len(zipcodes) + (MAX_DATE - MIN_DATE).days
progress = 0

try:
    for zipcode in zipcodes:
        print(zipcode)
        result[zipcode] = {}
        date = MIN_DATE
        year = int(date.year)
        month = int(date.month)
        day = int(date.day)
        result[zipcode][year] = {}
        result[zipcode][year][month] = {}
        result[zipcode][year][month][day] = {}
        while date < MAX_DATE:
            link = alminac
            link = link.replace("CODE", zipcode)
            link = link.replace("YEAR", date.strftime("%Y"))
            link = link.replace("MONTH", date.strftime("%m"))
            link = link.replace("DAY", date.strftime("%d"))
            result[zipcode][year][month][day]["link"] = link

            res = session.get(link)
            res.html.render()
            mean = None
            try:
                mean = float(
                    res.html.find(
                        "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.temp > td > p > span.value"
                    )[0].text
                )
            except:
                pass
            minimum = None
            try:
                minimum = float(
                    res.html.find(
                        "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.temp_mn > td > p > span.value"
                    )[0].text
                )
            except:
                pass
            maximum = None
            try:
                maximum = float(
                    res.html.find(
                        "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.temp_mx > td > p > span.value"
                    )[0].text
                )
            except:
                pass
            precipitation = None
            try:
                precipitation = float(
                    res.html.find(
                        "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.prcp > td > p > span.value"
                    )[0].text
                )
            except:
                pass
            meanWind = None
            try:
                meanWind = float(
                    res.html.find(
                        "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.wdsp > td > p > span.value"
                    )[0].text
                )
            except:
                pass
            maxWind = None
            try:
                maxWind = float(
                    res.html.find(
                        "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.mxspd > td > p > span.value"
                    )[0].text
                )
            except:
                pass
            snowDepth = None
            try:
                snowDepth = float(
                    res.html.find(
                        "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.sndp > td > p > span.value"
                    )[0].text
                )
            except:
                pass
            pressure = None
            try:
                pressure = float(
                    res.html.find(
                        "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.slp > td > p > span.value"
                    )[0].text
                )
            except:
                pass
            dewPoint = None
            try:
                dewPoint = float(
                    res.html.find(
                        "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.dewp > td > p > span.value"
                    )[0].text
                )
            except:
                pass
            visibility = None
            try:
                visibility = float(
                    res.html.find(
                        "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.visib > td > p > span.value"
                    )[0].text
                )
            except:
                pass
            maxGust = None
            try:
                maxGust = float(
                    res.html.find(
                        "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.gust > td > p > span.value"
                    )[0].text
                )
            except:
                pass

            result[zipcode][year][month][day]["temperature"] = {}
            result[zipcode][year][month][day]["temperature"]["minimum"] = minimum
            result[zipcode][year][month][day]["temperature"]["mean"] = mean
            result[zipcode][year][month][day]["temperature"]["maximum"] = maximum
            result[zipcode][year][month][day]["pressureAndDewPoint"] = {}
            result[zipcode][year][month][day]["pressureAndDewPoint"][
                "dewPoint"
            ] = dewPoint
            result[zipcode][year][month][day]["pressureAndDewPoint"][
                "pressure"
            ] = pressure
            result[zipcode][year][month][day]["precipitation"] = {}
            result[zipcode][year][month][day]["precipitation"]["total"] = precipitation
            result[zipcode][year][month][day]["precipitation"]["snowDepth"] = snowDepth
            result[zipcode][year][month][day]["precipitation"][
                "visibility"
            ] = visibility
            result[zipcode][year][month][day]["wind"] = {}
            result[zipcode][year][month][day]["wind"]["mean"] = meanWind
            result[zipcode][year][month][day]["wind"]["max"] = maxWind
            result[zipcode][year][month][day]["wind"]["maxGust"] = maxGust
            time.sleep(10)  # Sleep to avoid getting IP banned
            
            progress = progress + 1
            progressPercent = float(progress / totalProgress) * 100
            with open("progress", "w") as file:
                file.write("progress: " + str(progressPercent))
            date = date + datetime.timedelta(days=1)
    print("Done.")
except:
    print("Encountered error, saving to file.")
    traceback.print_exc()
finally:
    f.write(json.dumps(result))
    f.close()
