package com.example.HongBridge.controller;

import com.example.HongBridge.dto.ChatRequest;
import com.example.HongBridge.service.OpenAiService;
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
