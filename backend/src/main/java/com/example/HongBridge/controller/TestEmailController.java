package com.example.HongBridge.controller;

import com.example.HongBridge.scheduler.ScheduleEmailScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestEmailController {

    private final ScheduleEmailScheduler scheduleEmailScheduler;

    @PostMapping("/email")
    public String sendTestEmail() {
        scheduleEmailScheduler.sendTomorrowScheduleEmails();
        return "✅ 내일 일정 메일 발송 테스트 완료";
    }
}
