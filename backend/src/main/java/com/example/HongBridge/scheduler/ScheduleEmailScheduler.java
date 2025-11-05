package com.example.HongBridge.scheduler;

import com.example.HongBridge.entity.Schedule;
import com.example.HongBridge.repository.ScheduleRepository;
import com.example.HongBridge.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduleEmailScheduler {

    private final ScheduleRepository scheduleRepository;
    private final EmailService emailService;

    // 매일 저녁 8시에 실행
    @Scheduled(cron = "0 * * * * *")
    public void sendTomorrowScheduleEmails() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        log.info("=== [홍브릿지] {} 일정 메일 전송 시작 ===", tomorrow);

        List<Schedule> schedules = scheduleRepository.findByStartDate(tomorrow);

        for (Schedule schedule : schedules) {
            LocalDate scheduleDate = schedule.getStart().toLocalDate();

            if (scheduleDate.equals(tomorrow)) {
                String email = schedule.getUser().getEmail();
                String title = schedule.getTitle();
                String description = schedule.getDescription();

                String subject = "[홍브릿지] 내일 일정 알림: " + title;
                String text = String.format(
                        "안녕하세요 %s님!\n\n내일(%s)에 예정된 일정이 있습니다.\n\n제목: %s\n내용: %s\n\n좋은 하루 되세요!\n\n- HongBridge 팀 드림",
                        schedule.getUser().getName(), tomorrow, title, description
                );

                try {
                    emailService.sendMail(email, subject, text);
                    log.info("📧 일정 알림 메일 전송 완료: {}", email);
                } catch (Exception e) {
                    log.error("❌ 메일 전송 실패: {}", email, e);
                }
            }
        }

        log.info("=== [홍브릿지] 일정 메일 전송 완료 ===");
    }
}
