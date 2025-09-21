package com.example.HongBridge.service;

import com.example.HongBridge.entity.Field;
import com.example.HongBridge.entity.Qualification;
import com.example.HongBridge.repository.FieldRepository;
import com.example.HongBridge.repository.QualificationRepository;
import com.example.HongBridge.repository.DateRepository;
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

    private final FieldRepository fieldRepository;
    private final QualificationRepository qualificationRepository;
    private final DateRepository dateRepository;

    public OpenAiService(FieldRepository fieldRepository,
                         QualificationRepository qualificationRepository,
                         DateRepository dateRepository) {
        this.fieldRepository = fieldRepository;
        this.qualificationRepository = qualificationRepository;
        this.dateRepository = dateRepository;
    }

    public String getChatResponse(String userMessage) throws Exception {
        System.out.println("✅ [DEBUG] 사용자 메시지: " + userMessage);

        String keyword = extractKeyword(userMessage);
        System.out.println("✅ [DEBUG] 추출된 키워드: " + keyword);

        if (keyword.isEmpty()) {
            return "질문에서 키워드를 찾지 못했습니다. 다시 입력해 주세요.";
        }

        List<Field> matchedFields = fieldRepository
                .findByDepth1ContainingOrDepth2Containing(keyword, keyword);

        List<Qualification> matchedQualifications = qualificationRepository
                .findByNameContaining(keyword);

        System.out.println("✅ [DEBUG] 매칭된 Field 개수: " + matchedFields.size());
        System.out.println("✅ [DEBUG] 매칭된 Qualification 개수: " + matchedQualifications.size());

        if (matchedFields.isEmpty() && matchedQualifications.isEmpty()) {
            System.out.println("⚠️ [DEBUG] DB 매칭 실패 → 일반 GPT 응답 사용");
            return getGeneralChatResponse(userMessage);
        }

        List<String> dbInfos = new ArrayList<>();

        for (Qualification q : matchedQualifications) {
            Field f = q.getField();
            StringBuilder infoBuilder = new StringBuilder();
            infoBuilder.append("- 자격증: ").append(q.getName())
                    .append(" | 분야: ").append(f != null ? f.getDepth1() + " > " + f.getDepth2() : "분야 없음")
                    .append(" | JMCD: ").append(q.getJmCd());

            dateRepository.findTopByJmCdOrderByYearDescPeriodDesc(q.getJmCd())
                    .ifPresent(d -> {
                        infoBuilder.append(" | 최근 시험 일정:");
                        // 필기
                        infoBuilder.append(" [필기 등록] ").append(d.getDocRegStart()).append(" ~ ").append(d.getDocRegEnd());
                        infoBuilder.append(" [필기 응시] ").append(d.getDocExamStart()).append(" ~ ").append(d.getDocExamEnd());
                        infoBuilder.append(" [필기 합격] ").append(d.getDocPass());

                        // 실기
                        infoBuilder.append(" [실기 등록] ").append(d.getPracRegStart()).append(" ~ ").append(d.getPracRegEnd());
                        infoBuilder.append(" [실기 응시] ").append(d.getPracExamStart()).append(" ~ ").append(d.getPracExamEnd());
                        infoBuilder.append(" [실기 합격] ").append(d.getPracPass());
                    });

            dbInfos.add(infoBuilder.toString());
        }

        for (Field f : matchedFields) {
            List<Qualification> qs = qualificationRepository.findByField_Id(f.getId());
            for (Qualification q : qs) {
                StringBuilder infoBuilder = new StringBuilder();
                infoBuilder.append("- 자격증: ").append(q.getName())
                        .append(" | 분야: ").append(f.getDepth1()).append(" > ").append(f.getDepth2())
                        .append(" | JMCD: ").append(q.getJmCd());

                dateRepository.findTopByJmCdOrderByYearDescPeriodDesc(q.getJmCd())
                        .ifPresent(d -> {
                            infoBuilder.append(" | 최근 시험 일정:");
                            // 필기
                            infoBuilder.append(" [필기 등록] ").append(d.getDocRegStart()).append(" ~ ").append(d.getDocRegEnd());
                            infoBuilder.append(" [필기 응시] ").append(d.getDocExamStart()).append(" ~ ").append(d.getDocExamEnd());
                            infoBuilder.append(" [필기 합격] ").append(d.getDocPass());

                            // 실기
                            infoBuilder.append(" [실기 등록] ").append(d.getPracRegStart()).append(" ~ ").append(d.getPracRegEnd());
                            infoBuilder.append(" [실기 응시] ").append(d.getPracExamStart()).append(" ~ ").append(d.getPracExamEnd());
                            infoBuilder.append(" [실기 합격] ").append(d.getPracPass());
                        });

                dbInfos.add(infoBuilder.toString());
            }
        }

        if (dbInfos.isEmpty()) {
            System.out.println("⚠️ [DEBUG] 매칭된 자격증 정보 없음 → 일반 GPT 응답 사용");
            return getGeneralChatResponse(userMessage);
        }

        if (dbInfos.size() > 100) {
            dbInfos = dbInfos.subList(0, 100);
        }

        String dbInfo = String.join("\n", dbInfos);

        String systemPrompt =
                "너는 대학생 진로 상담을 도와주는 전문가야.\n" +
                        "사용자가 특정 전공, 학과, 분야에 대해 질문하면 반드시 아래 자격증 데이터베이스 정보를 기반으로 자격증을 추천해줘.\n" +
                        "다른 정보는 사용하지 말고 반드시 아래 정보만 기반으로 답변해.\n\n" +
                        "=== 자격증 데이터베이스 ===\n" +
                        dbInfo + "\n" +
                        "=========================";

        System.out.println("✅ [DEBUG] OpenAI systemPrompt 준비 완료");

        String requestBody = "{\n" +
                "  \"model\": \"gpt-3.5-turbo\",\n" +
                "  \"messages\": [\n" +
                "    {\"role\": \"system\", \"content\": \"" + escapeJson(systemPrompt) + "\"},\n" +
                "    {\"role\": \"user\", \"content\": \"" + escapeJson(userMessage) + "\"}\n" +
                "  ]\n" +
                "}";

        return callOpenAiApi(requestBody);
    }

    private String callOpenAiApi(String requestBody) throws Exception {
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

        System.out.println("✅ [DEBUG] OpenAI API 응답 바디: " + responseBody);

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
            if (clean.length() >= 2 &&
                    !clean.matches(".*(관련|자격증|필요|있|어|학과|과|전공|하는).*")) {
                return clean;
            }
        }
        return "";
    }

    private String escapeJson(String input) {
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n");
    }

    private String getGeneralChatResponse(String userMessage) throws Exception {
        System.out.println("⚠️ [DEBUG] 일반 GPT 응답 사용");
        String requestBody = "{\n" +
                "  \"model\": \"gpt-3.5-turbo\",\n" +
                "  \"messages\": [\n" +
                "    {\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},\n" +
                "    {\"role\": \"user\", \"content\": \"" + escapeJson(userMessage) + "\"}\n" +
                "  ]\n" +
                "}";
        return callOpenAiApi(requestBody);
    }
}
