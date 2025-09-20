import os
import time
import requests
import xml.etree.ElementTree as ET
import pymysql
from contextlib import contextmanager

from dotenv import load_dotenv

# --- Selenium ---
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


# =========================
# 환경설정/유틸
# =========================
load_dotenv()  # .env 로드

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DB = os.getenv("MYSQL_DB", "qnet_crawling2")
MYSQL_CHARSET = os.getenv("MYSQL_CHARSET", "utf8mb4")

QNET_API_KEY = os.getenv("QNET_API_KEY", "")  # 공공데이터 API Key

@contextmanager
def mysql_conn():
    conn = None
    try:
        conn = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DB,
            charset=MYSQL_CHARSET,
            autocommit=False,
        )
        yield conn
        conn.commit()
    except Exception:
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()


# =========================
# DB 저장 함수
# =========================
def save_field(cursor, field_id: str, depth1: str, depth2: str):
    cursor.execute(
        """
        INSERT INTO field (id, depth1, depth2)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE depth1=%s, depth2=%s
        """,
        (field_id, depth1, depth2, depth1, depth2),
    )

def save_qualification(cursor, field_id: str, items: list[tuple[str, str]]):
    for name, jmCd in items:
        cursor.execute(
            """
            INSERT INTO qualification (name, JMCD, fieldId, course)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE name=%s, fieldId=%s
            """,
            (name, jmCd, field_id, None, name, field_id),
        )

def save_exam_schedule(cursor, schedules: list[dict]):
    if not schedules:
        return
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


# =========================
# API 통신
# =========================
def to_datetime_or_none(value: str | None):
    if value is None:
        return None
    v = value.strip()
    return v if v else None

def fetch_exam_schedule(jmCd: str, year: str = "2025") -> list[dict]:
    if not QNET_API_KEY:
        print("⚠️  QNET_API_KEY가 비어 있습니다. .env를 확인하세요.")
        return []

    url = "http://apis.data.go.kr/B490007/qualExamSchd/getQualExamSchdList"
    params = {
        "serviceKey": QNET_API_KEY,
        "pageNo": "1",
        "numOfRows": "50",
        "dataFormat": "xml",
        "implYy": year,
        "jmCd": jmCd,
    }
    resp = requests.get(url, params=params, timeout=20)
    if resp.status_code != 200:
        print(f"⚠️  {jmCd} 일정 조회 실패: HTTP {resp.status_code}")
        return []

    try:
        root = ET.fromstring(resp.text)
    except ET.ParseError:
        print(f"⚠️  {jmCd} XML 파싱 실패")
        return []

    items = root.findall(".//item")
    schedules: list[dict] = []
    for item in items:
        schedules.append(
            {
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
            }
        )
    return schedules


# =========================
# 크롤링
# =========================
def build_chrome(headless: bool = True) -> webdriver.Chrome:
    options = webdriver.ChromeOptions()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    # 맥에서 크롬이 기본 경로에 설치되어 있어야 합니다.

    service = ChromeService(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver

def crawl_fields_and_qualifications() -> None:
    print("🔍 크롤링 시작...\n")
    driver = build_chrome(headless=True)
    wait = WebDriverWait(driver, 10)

    try:
        driver.get("https://q-net.or.kr/crf005.do#none")

        with mysql_conn() as conn:
            cursor = conn.cursor()

            # 1차 분야
            all_first = wait.until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a[data-target^='duty_step2_']"))
            )
            first_level_links = [e for e in all_first if e.is_displayed()]

            for i in range(len(first_level_links)):
                all_first = wait.until(
                    EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a[data-target^='duty_step2_']"))
                )
                first_level_links = [e for e in all_first if e.is_displayed()]

                first = first_level_links[i]
                first_text = first.text.strip()
                print(f"▶ 1차 클릭: {first_text}")
                driver.execute_script("arguments[0].click();", first)
                time.sleep(0.5)

                # 2차 분야
                try:
                    all_second = wait.until(
                        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a[data-target^='duty_step3_']"))
                    )
                    second_level_links = [e for e in all_second if e.is_displayed()]
                except Exception:
                    continue

                for j in range(len(second_level_links)):
                    all_second = wait.until(
                        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a[data-target^='duty_step3_']"))
                    )
                    second_level_links = [e for e in all_second if e.is_displayed()]

                    second = second_level_links[j]
                    second_text = second.text.strip()
                    second_id = second.get_attribute("data-target")
                    print(f"  ▶ 2차 클릭: {second_text} (id={second_id})")

                    # 분야 저장
                    save_field(cursor, second_id, first_text, second_text)

                    driver.execute_script("arguments[0].click();", second)
                    time.sleep(0.5)

                    # 자격증 수집
                    try:
                        third_links = WebDriverWait(driver, 5).until(
                            EC.presence_of_all_elements_located(
                                (By.CSS_SELECTOR, "div.qualList.qulList_lv4 div.limitY div.item ul li")
                            )
                        )
                        if third_links:
                            items: list[tuple[str, str]] = []
                            for li in third_links:
                                jmCd = li.find_element(By.CSS_SELECTOR, "input[name='jmcd']").get_attribute("value").strip()
                                name = li.find_element(By.CSS_SELECTOR, "input[name='jmNm']").get_attribute("value").strip()
                                items.append((name, jmCd))
                                print(f"      - {name} (jmCd={jmCd})")

                            save_qualification(cursor, second_id, items)
                    except Exception:
                        # 자격증 없는 2차 분야일 수 있음
                        pass

                # 첫 화면 복귀
                driver.get("https://q-net.or.kr/crf005.do#none")
                wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a[data-target^='duty_step2_']")))
                time.sleep(0.5)

    finally:
        driver.quit()
        print("\n✅ 크롤링 완료!")


# =========================
# 메인
# =========================
def main():
    # 1) 분야/자격증 크롤링 후 DB 저장
    crawl_fields_and_qualifications()

    # 2) DB의 JMCD 전부 조회 후 시험일정 API 저장
    with mysql_conn() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT JMCD FROM qualification WHERE JMCD IS NOT NULL")
        jmcd_list = [row[0] for row in cursor.fetchall()]

        for jmCd in jmcd_list:
            print(f"📡 jmCd={jmCd} 시험 일정 가져오는 중...")
            schedules = fetch_exam_schedule(jmCd, "2025")
            if schedules:
                save_exam_schedule(cursor, schedules)

    print("✅ 모든 자격증 시험 일정 저장 완료")


if __name__ == "__main__":
    main()