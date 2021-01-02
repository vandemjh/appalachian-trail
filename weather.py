import traceback
import requests
from requests.models import Response
from requests_html import HTMLSession
import json
import time
import datetime
import os
import random

DEBUG = True

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


def writeToFile(result: dict):
    with open("out.json", "w") as f:
        f.write(json.dumps(result))
        f.close()


# Returns None if error
def getElement(element: str, res: Response) -> str or None:
    try:
        return res.html.find(element)[0].text
    except:
        return None


def getElementFloat(element: str, res: Response) -> float or None:
    try:
        return float(getElement(element, res))
    except:
        return None


result = {}

MAX_DATE = datetime.datetime(2020, 1, 1)
MIN_DATE = datetime.datetime(2015, 1, 1)
totalProgress = len(zipcodes) * (MAX_DATE - MIN_DATE).days
progress = 0


for zipcode in zipcodes:
    if DEBUG:
        print("Writing to file")
    writeToFile(result)
    if not zipcode in result:
        result[zipcode] = {}
    date = MIN_DATE
    while date < MAX_DATE:
        year = int(date.year)
        month = int(date.month)
        day = int(date.day)
        try:
            # Create dicts for year month day if they do not exist
            if not year in result[zipcode]:
                result[zipcode][year] = {}
            if not month in result[zipcode][year]:
                result[zipcode][year][month] = {}
            if not day in result[zipcode][year][month]:
                result[zipcode][year][month][day] = {}

            progressDateBefore = date.now()
            link = alminac
            link = link.replace("CODE", zipcode)
            link = link.replace("YEAR", date.strftime("%Y"))
            link = link.replace("MONTH", date.strftime("%m"))
            link = link.replace("DAY", date.strftime("%d"))
            if not "link" in result[zipcode][year][month][day]:
                result[zipcode][year][month][day]["link"] = link

            session = HTMLSession()
            res = session.get(link)
            print("\tGet request took: " + str((date.now() - progressDateBefore)))
            res.html.render(timeout=100)
            print("\tRender took: " + str((date.now() - progressDateBefore)))

            mean = getElementFloat(
                "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.temp > td > p > span.value",
                res,
            )
            minimum = getElementFloat(
                "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.temp_mn > td > p > span.value",
                res,
            )
            maximum = getElementFloat(
                "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.temp_mx > td > p > span.value",
                res,
            )
            precipitation = getElementFloat(
                "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.prcp > td > p > span.value",
                res,
            )
            meanWind = getElementFloat(
                "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.wdsp > td > p > span.value",
                res,
            )
            maxWind = getElementFloat(
                "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.mxspd > td > p > span.value",
                res,
            )
            snowDepth = getElementFloat(
                "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.sndp > td > p > span.value",
                res,
            )
            pressure = getElementFloat(
                "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.slp > td > p > span.value",
                res,
            )
            dewPoint = getElementFloat(
                "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.dewp > td > p > span.value",
                res,
            )
            visibility = getElementFloat(
                "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.visib > td > p > span.value",
                res,
            )
            maxGust = getElementFloat(
                "#block-system-main > table.weatherhistory_results > tbody > tr.weatherhistory_results_datavalue.gust > td > p > span.value",
                res,
            )

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

            progress = progress + 1
            progressPercent = (progress / totalProgress) * 100
            progressDateDiff = date.now() - progressDateBefore
            print("\tScrape took: " + str(date.now() - progressDateBefore))
            with open("progress", "w") as file:
                file.write(
                    "progress: "
                    + str(progressPercent)
                    + "\nLast scrape took: "
                    + str(progressDateDiff)
                    + "\nCurrent date: "
                    + str(date)
                    + "\n"
                )
            time.sleep(0 + random.randint(0, 60))  # Sleep to avoid getting IP banned
            session.close()
            if DEBUG:
                print(result)
        except Exception as e:
            print("Encountered error")
            result[zipcode][year][month][day]["error"] = str(e)
            traceback.print_exc()
        finally:
            date = date + datetime.timedelta(days=1)
print("Done.")

writeToFile(result)