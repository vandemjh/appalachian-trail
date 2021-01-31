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

DEBUG = True if len(sys.argv) > 1 and sys.argv[1] == "--debug" else False
# Iterations to wait between writes to file
PERIODIC_SAVE = 10

alminac = "https://www.almanac.com/weather/history/zipcode/CODE/YEAR-MONTH-DAY"
zipcodes = [
    "30513",  # Springer Mtn
    "30512",  # US Hwy 19
    "30545",  # Helen GA 30545/Hiawassee GA 30546/SR 75
    "28734",  # Franklin NC 28734/Winding Stair Gap TH/US Hwy 64
    "28713",  # US Hwy 74
    "28733",  # Fontana Dam NC 28733/Fontana Village Marina TH
    "37753",  # Waterville School Road TH
    "28743",  # Trail head parking in Hot Springs TH
    "37650",  # Erwin TN 37650
    "37687",  # Roan Mountain TN 37687/Elk Park NC 28622/SR 37
    "37658",  # Hampton TN 37658
    "24236",  # Damascus VA 24236
    "24311",  # Atkins VA 24311
    "24134",  # Pearisburg VA 24134/SR 100
    "24077",  # Cloverdale VA 24077/Daleville VA 24083/US Hwy 220
    "24555",  # Glasgow VA 24555/US 501 TH
    "22980",  # Waynesboro VA 22980/I-64/I-64
    "22835",  # US Hwy 211
    "25425",  # Harpers Ferry WV 25425
    "17222",  # Fayetteville PA 17222/US Hwy 30
    "17020",  # Duncannon PA 17020
    "19549",  # Port Clinton PA 19549/Port Clinton Ave TH
    "18327",  # Delaware Water Gap PA 18327
    "07462",  # Vernon NJ 07462/NJ 94 (Annex) TH/County Rd 515
    "10911",  # Bear Mountain NY 10911/Peekskill NY 10566
    "06757",  # Kent CT 06757
    "06068",  # Salisbury CT 06068
    "01247",  # North Adams MA 01247/Williamstown MA 01267/SR 2
    "05255",  # Manchester Center VT 05255
    "05751",  # Killington VT 05751
    "03755",  # Hanover NH 03755
    "03262",  # North Woodstock NH 03262/SR 112
    "03581",  # Gorham NH 03581
    "04216",  # Andover ME 04216
    "04982",  # Stratton ME 04982/SR 16/SR 27
    "04464",  # Monson ME 04464
    "04462",  # Mt Katahdin
]


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


result = {}
periodicSaveCounter = 0

MAX_DATE = datetime.datetime(2020, 1, 1)
MIN_DATE = datetime.datetime(2019, 1, 1)
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
            periodicSaveCounter = periodicSaveCounter + 1
            if periodicSaveCounter > PERIODIC_SAVE:
                writeToFile(result)
                periodicSaveCounter = 0

print("Done.")

writeToFile(result)