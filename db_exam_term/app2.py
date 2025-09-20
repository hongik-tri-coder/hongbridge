import requests
import xml.etree.ElementTree as ET
import pymysql

API_KEY = "9aa104a7dabd35bedd0c93bad373cd645655d30f4edfd6dc28f671e7b023fb48"

conn = pymysql.connect(
    host="localhost",
    user="root",
    password="Dlawodjs630!",
    database="qnet_crawling2",
    charset="utf8mb4"
)
cursor = conn.cursor()

def to_datetime_or_none(value):
    if value is None or value.strip() == "":
        return None
    return value

def fetch_exam_schedule(jmCd, year="2025"):
    url = "http://apis.data.go.kr/B490007/qualExamSchd/getQualExamSchdList"
    params = {"serviceKey": API_KEY, "pageNo": "1", "numOfRows": "50", "dataFormat": "xml", "implYy": year, "jmCd": jmCd}
    response = requests.get(url, params=params)
    if response.status_code != 200:
        return []
    root = ET.fromstring(response.text)
    items = root.findall(".//item")

    schedules = []
    for item in items:
        schedules.append({
            "jmCd": jmCd,
            "year": item.findtext("implYy"),
            "period": item.findtext("implSeq"),
            "docRegStart": to_datetime_or_none(item.findtext("docRegStartDt")),
            "docRegEnd": to_datetime_or_none(item.findtext("docRegEndDt")),
            "docVacancyStart": to_datetime_or_none(item.findtext("docRegStartDt2")),
            "docVacancyEnd": to_datetime_or_none(item.findtext("docRegEndDt2")),
            "docExamStart": to_datetime_or_none(item.findtext("docExamStartDt")),
            "docExamEnd": to_datetime_or_none(item.findtext("docExamEndDt")),
            "docPass": to_datetime_or_none(item.findtext("docPassDt")),
            "pracRegStart": to_datetime_or_none(item.findtext("pracRegStartDt")),
            "pracRegEnd": to_datetime_or_none(item.findtext("pracRegEndDt")),
            "pracVacancyStart": to_datetime_or_none(item.findtext("pracRegStartDt2")),
            "pracVacancyEnd": to_datetime_or_none(item.findtext("pracRegEndDt2")),
            "pracExamStart": to_datetime_or_none(item.findtext("pracExamStartDt")),
            "pracExamEnd": to_datetime_or_none(item.findtext("pracExamEndDt")),
            "pracPass": to_datetime_or_none(item.findtext("pracPassDt")),
        })
    return schedules

def save_exam_schedule(schedules):
    sql = """
    REPLACE INTO date (
        jmCd, year, period,
        docRegStart, docRegEnd, docVacancyStart, docVacancyEnd,
        docExamStart, docExamEnd, docPass,
        pracRegStart, pracRegEnd, pracVacancyStart, pracVacancyEnd,
        pracExamStart, pracExamEnd, pracPass
    ) VALUES (
        %(jmCd)s, %(year)s, %(period)s,
        %(docRegStart)s, %(docRegEnd)s, %(docVacancyStart)s, %(docVacancyEnd)s,
        %(docExamStart)s, %(docExamEnd)s, %(docPass)s,
        %(pracRegStart)s, %(pracRegEnd)s, %(pracVacancyStart)s, %(pracVacancyEnd)s,
        %(pracExamStart)s, %(pracExamEnd)s, %(pracPass)s
    )
    """
    for sch in schedules:
        cursor.execute(sql, sch)
    conn.commit()

cursor.execute("SELECT JMCD FROM qualification WHERE JMCD IS NOT NULL")
jmcd_list = [row[0] for row in cursor.fetchall()]

for jmCd in jmcd_list:
    print(f"📡 jmCd={jmCd} 시험 일정 가져오는 중...")
    schedules = fetch_exam_schedule(jmCd, "2025")
    if schedules:
        save_exam_schedule(schedules)

print("✅ 모든 자격증 시험 일정 저장 완료")

cursor.close()
conn.close()
