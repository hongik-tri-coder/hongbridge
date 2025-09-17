package com.example.HongBridge.service;

import com.example.HongBridge.entity.Item;
import com.example.HongBridge.entity.SecondCategory;
import com.example.HongBridge.repository.ItemRepository;
import com.example.HongBridge.repository.SecondCategoryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OpenAiService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    @Value("${openai.organization.id:}")
    private String organizationId;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ItemRepository itemRepository;
    private final SecondCategoryRepository secondCategoryRepository;

    public OpenAiService(ItemRepository itemRepository, SecondCategoryRepository secondCategoryRepository) {
        this.itemRepository = itemRepository;
        this.secondCategoryRepository = secondCategoryRepository;
    }

    public String getChatResponse(String userMessage) throws Exception {
        String keyword = extractKeyword(userMessage);
        //System.out.println("✅ [DEBUG] 추출된 키워드: " + keyword);
        if (keyword.isEmpty()) {
            return "질문에서 키워드를 찾지 못했습니다. 다시 입력해 주세요.";
        }

        // SecondCategory에서 name 또는 firstCategoryName에 키워드가 포함된 항목 찾기
        List<SecondCategory> matchedCategories = secondCategoryRepository
                .findByNameContainingOrFirstCategoryNameContaining(keyword, keyword);
//        System.out.println("✅ [DEBUG] 매칭된 SecondCategory 개수: " + matchedCategories.size());
//        for (SecondCategory category : matchedCategories) {
//            System.out.println("🧩 [DEBUG] - 분야명: " + category.getFirstCategoryName() + " / 세부분야명: " + category.getName());
//        }
//        System.out.println("✅ [DEBUG] 전체 SecondCategory 목록:");
//        List<SecondCategory> allCategories = secondCategoryRepository.findAll();
//        for (SecondCategory category : allCategories) {
//            System.out.println("🔹 name: " + category.getName() +
//                    " | firstCategoryName: " + category.getFirstCategoryName());
//        }
        if (matchedCategories.isEmpty()) {
            return getGeneralChatResponse(userMessage);
        }

        // 관련된 second_category_id 수집
        List<Long> categoryIds = matchedCategories.stream()
                .map(SecondCategory::getId)
                .collect(Collectors.toList());

        // 해당 id들과 일치하는 자격증(Item) 검색
        List<Item> items = itemRepository.findBySecondCategoryIdIn(categoryIds);

        if (items.isEmpty()) {
            return getGeneralChatResponse(userMessage);
        }

        // 최대 100개 제한
        if (items.size() > 100) {
            items = items.subList(0, 100);
        }

        // 자격증 정보 문자열 생성
        String dbInfo = items.stream()
                .map(item -> {
                    SecondCategory cat = item.getSecondCategory();
                    return "- 자격증: " + item.getName()
                            + " | 분야: " + cat.getFirstCategoryName()
                            + " > " + cat.getName();
                })
                .collect(Collectors.joining("\n"));

        String systemPrompt =
                "너는 대학생 진로 상담을 도와주는 전문가야.\n" +
                        "사용자가 특정 전공, 학과, 분야에 대해 질문하면 반드시 아래 자격증 데이터베이스 정보를 기반으로 자격증을 추천해줘.\n" +
                        "다른 정보는 사용하지 말고 반드시 아래 정보만 기반으로 답변해.\n\n" +
                        "=== 자격증 데이터베이스 ===\n" +
                        dbInfo + "\n" +
                        "=========================";

        String requestBody = "{\n" +
                "  \"model\": \"gpt-3.5-turbo\",\n" +
                "  \"messages\": [\n" +
                "    {\"role\": \"system\", \"content\": \"" + escapeJson(systemPrompt) + "\"},\n" +
                "    {\"role\": \"user\", \"content\": \"" + escapeJson(userMessage) + "\"}\n" +
                "  ]\n" +
                "}";

        // OpenAI API 호출
        URL url = new URL(apiUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + apiKey);
        conn.setRequestProperty("Content-Type", "application/json");
        if (organizationId != null && !organizationId.isEmpty()) {
            conn.setRequestProperty("OpenAI-Organization", organizationId);
        }
        conn.setDoOutput(true);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(requestBody.getBytes());
            os.flush();
        }

        int statusCode = conn.getResponseCode();
        InputStream responseStream = (statusCode >= 200 && statusCode < 300)
                ? conn.getInputStream()
                : conn.getErrorStream();

        BufferedReader br = new BufferedReader(new InputStreamReader(responseStream));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            sb.append(line).append("\n");
        }
        String responseBody = sb.toString();

        if (statusCode != 200) {
            throw new RuntimeException("OpenAI API 요청 실패 (" + statusCode + "): " + responseBody);
        }

        JsonNode response = objectMapper.readTree(responseBody);
        return response.get("choices").get(0).get("message").get("content").asText();
    }

    private String extractKeyword(String message) {
        if (message == null || message.isEmpty()) return "";

        String[] tokens = message.split("\\s+");
        for (String token : tokens) {
            String clean = token.replaceAll("[^가-힣a-zA-Z0-9]", "");
            // '학과', '과', '관련된', '분야', '자격증' 같은 일반 단어 제외
            if (clean.length() >= 2 &&
                    !clean.matches(".*(관련|자격증|필요|있|어|학과|과|전공|하는).*")) {
                return clean;
            }
        }
        return "";
    }

    private String escapeJson(String input) {
        return input
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n");
    }

    // 일반 GPT 응답 (DB 정보 없이)
    private String getGeneralChatResponse(String userMessage) throws Exception {
        String requestBody = "{\n" +
                "  \"model\": \"gpt-3.5-turbo\",\n" +
                "  \"messages\": [\n" +
                "    {\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},\n" +
                "    {\"role\": \"user\", \"content\": \"" + escapeJson(userMessage) + "\"}\n" +
                "  ]\n" +
                "}";

        URL url = new URL(apiUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + apiKey);
        conn.setRequestProperty("Content-Type", "application/json");

        if (organizationId != null && !organizationId.isEmpty()) {
            conn.setRequestProperty("OpenAI-Organization", organizationId);
        }

        conn.setDoOutput(true);
        try (OutputStream os = conn.getOutputStream()) {
            os.write(requestBody.getBytes());
            os.flush();
        }

        int statusCode = conn.getResponseCode();
        InputStream responseStream = (statusCode >= 200 && statusCode < 300)
                ? conn.getInputStream()
                : conn.getErrorStream();

        String responseBody = new BufferedReader(new InputStreamReader(responseStream))
                .lines().collect(Collectors.joining("\n"));

        if (statusCode != 200) {
            throw new RuntimeException("OpenAI API 요청 실패 (" + statusCode + "): " + responseBody);
        }

        JsonNode response = objectMapper.readTree(responseBody);
        return response.get("choices").get(0).get("message").get("content").asText();
    }

}
