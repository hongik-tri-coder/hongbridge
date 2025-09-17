package com.example.HongBridge.ai.controller;

import com.example.HongBridge.ai.dto.chat.ChatRequest;
import com.example.HongBridge.ai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private OpenAiService openAiService;

    @PostMapping
    public String chat(@RequestBody ChatRequest chatRequest) throws Exception {
        return openAiService.getChatResponse(chatRequest.getMessage());
    }
}
