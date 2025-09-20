from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pymysql
import time

# MySQL 연결
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='Dlawodjs630!',
    database='qnet_crawling2',
    charset='utf8mb4'
)
cursor = conn.cursor()

# 분야 저장
def save_field(field_id, depth1, depth2):
    cursor.execute("""
        INSERT INTO field (id, depth1, depth2)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE depth1=%s, depth2=%s
    """, (field_id, depth1, depth2, depth1, depth2))
    conn.commit()

# 자격증 저장
def save_qualification(field_id, items):
    for name, jmCd in items:
        cursor.execute("""
            INSERT INTO qualification (name, JMCD, fieldId, course)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE name=%s, fieldId=%s
        """, (name, jmCd, field_id, None, name, field_id))
    conn.commit()

# 크롬 드라이버 실행
driver = webdriver.Chrome()
driver.get("https://q-net.or.kr/crf005.do#none")
wait = WebDriverWait(driver, 10)

print("🔍 크롤링 시작...\n")

# 1차 분야
all_first_level_links = wait.until(EC.presence_of_all_elements_located(
    (By.CSS_SELECTOR, "a[data-target^='duty_step2_']")))
first_level_links = [elem for elem in all_first_level_links if elem.is_displayed()]

for i in range(len(first_level_links)):
    all_first_level_links = wait.until(EC.presence_of_all_elements_located(
        (By.CSS_SELECTOR, "a[data-target^='duty_step2_']")))
    first_level_links = [elem for elem in all_first_level_links if elem.is_displayed()]

    first = first_level_links[i]
    first_text = first.text.strip()
    print(f"▶ 1차 클릭: {first_text}")
    driver.execute_script("arguments[0].click();", first)
    time.sleep(0.5)

    # 2차 분야
    try:
        all_second_level_links = wait.until(EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, "a[data-target^='duty_step3_']")))
        second_level_links = [elem for elem in all_second_level_links if elem.is_displayed()]
    except:
        continue

    for j in range(len(second_level_links)):
        all_second_level_links = wait.until(EC.presence_of_all_elements_located(
            (By.CSS_SELECTOR, "a[data-target^='duty_step3_']")))
        second_level_links = [elem for elem in all_second_level_links if elem.is_displayed()]

        second = second_level_links[j]
        second_text = second.text.strip()
        second_id = second.get_attribute("data-target")
        print(f"  ▶ 2차 클릭: {second_text} (id={second_id})")

        save_field(second_id, first_text, second_text)
        driver.execute_script("arguments[0].click();", second)
        time.sleep(0.5)

        # 자격증 수집
        try:
            third_links = WebDriverWait(driver, 5).until(
                EC.presence_of_all_elements_located(
                    (By.CSS_SELECTOR, "div.qualList.qulList_lv4 div.limitY div.item ul li"))
            )
            if third_links:
                items = []
                for li in third_links:
                    jmCd = li.find_element(By.CSS_SELECTOR, "input[name='jmcd']").get_attribute("value").strip()
                    name = li.find_element(By.CSS_SELECTOR, "input[name='jmNm']").get_attribute("value").strip()
                    items.append((name, jmCd))
                    print(f"      - {name} (jmCd={jmCd})")

                save_qualification(second_id, items)
        except:
            continue

    driver.get("https://q-net.or.kr/crf005.do#none")
    wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a[data-target^='duty_step2_']")))
    time.sleep(0.5)

print("\n✅ 크롤링 완료!")
driver.quit()
conn.close()
