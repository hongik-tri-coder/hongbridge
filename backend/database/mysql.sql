CREATE DATABASE qnet_crawling;
USE qnet_crawling;

CREATE TABLE IF NOT EXISTS SecondCategory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    first_category_name VARCHAR(255) NOT NULL,
    UNIQUE (name, first_category_name)
);

CREATE TABLE IF NOT EXISTS Item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    second_category_id INT,
    FOREIGN KEY (second_category_id) REFERENCES SecondCategory(id),
    UNIQUE (name, second_category_id)
);

USE qnet_crawling;

-- 2차 분류 테이블 확인
SELECT * FROM SecondCategory;

-- 시행 종목 테이블 확인
SELECT * FROM Item;

-- 중복된 SecondCategory 중 id가 가장 작은 것만 남기고 삭제




