import traceback
import requests
from requests.models import Response
from requests_html import HTMLSession
import json
import time
import datetime
import os
import random
import sys
from datetime import datetime

DEBUG = True if len(sys.argv) > 1 and sys.argv[1] == "--debug" else False
# Iterations to wait between writes to file
PERIODIC_SAVE = 10
# Prints temps to stdout for easy copy
SIMPLE_PRINT = True
# Time to sleep to avoid being banned
SLEEP = 0

alminac = "https://www.almanac.com/weather/history/zipcode/CODE/YEAR-MONTH-DAY"
with open("location.json", "r") as f:
    jsonFile: dict = json.loads(f.read())
    zipcodes = list(jsonFile.keys())
    dates = list(jsonFile.values())


def writeToFile(result: dict):
    if DEBUG:
        print("Writing to file")
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


def writeProgress(progressPercent, progressDateDiff, date):
    with open("progress", "w") as file:
        file.write(
            "progress: "
            + str(progressPercent)
            + "\nLast scrape took: "
            + str(progressDateDiff)
            + "\nOn date: "
            + str(date)
            + "\n"
        )


result = {}
periodicSaveCounter = 0

if not len(dates) == 0:
    DATE_DIF = len(dates)
    MAX_DATE = None
    MIN_DATE = None
else:
    MAX_DATE = datetime.datetime(2020, 1, 1)
    MIN_DATE = datetime.datetime(2019, 1, 1)
    DATE_DIF: int = MAX_DATE - MIN_DATE
totalProgress = len(zipcodes) * DATE_DIF
progress = 0
dateCounter = 0
DATES_GIVEN: bool = True if MAX_DATE is None else False


for zipcode in zipcodes:
    if DEBUG:
        print("Writing to file")
    writeToFile(result)
    if not zipcode in result:
        result[zipcode] = {}
    date = (
        MIN_DATE
        if not DATES_GIVEN
        else datetime.strptime(dates[dateCounter], "%Y-%m-%d")
    )
    while (date < MAX_DATE) if not DATES_GIVEN else (True):
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
            if DEBUG:
                print("\tGet request took: " + str((date.now() - progressDateBefore)))
            res.html.render(timeout=100)
            if DEBUG:
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
            if DEBUG:
                print("\tScrape took: " + str(date.now() - progressDateBefore))
            writeProgress(progressPercent, progressDateDiff, date)
            time.sleep(SLEEP)  # Sleep to avoid getting IP banned
            session.close()
            if DEBUG:
                print(result)
            if SIMPLE_PRINT:
                print(
                    "At "
                    + str(zipcode)
                    + " on "
                    + date.strftime("%Y-%m-%d")
                    + " - min: "
                    + str(minimum)
                    + " average: "
                    + str(mean)
                    + " max: "
                    + str(maximum)
                )
        except Exception as e:
            print("Encountered error")
            result[zipcode][year][month][day]["error"] = str(e)
            traceback.print_exc()
        finally:
            dateCounter = dateCounter + 1
            date = (
                (date + datetime.timedelta(days=1))
                if not DATES_GIVEN
                else datetime.strptime(dates[dateCounter - 1], "%Y-%m-%d")
            )
            periodicSaveCounter = periodicSaveCounter + 1
            if periodicSaveCounter > PERIODIC_SAVE:
                writeToFile(result)
                periodicSaveCounter = 0
            if DATES_GIVEN:
                break

print("Done.")

writeToFile(result)