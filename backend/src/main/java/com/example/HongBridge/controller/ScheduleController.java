package com.example.HongBridge.controller;

import com.example.HongBridge.entity.Member;
import com.example.HongBridge.entity.Schedule;
import com.example.HongBridge.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public List<Schedule> getSchedules(@AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        String studentId = user.getUsername();
        return scheduleService.getSchedulesByUser(studentId);
    }

    @PostMapping
    public Schedule createSchedule(@AuthenticationPrincipal Member member,
                                   @RequestBody Schedule schedule) {
        schedule.setUser(member);
        return scheduleService.createSchedule(schedule);
    }

    @PutMapping("/{id}")
    public Schedule updateSchedule(@PathVariable Long id,
                                   @RequestBody Schedule schedule) {
        return scheduleService.updateSchedule(id, schedule);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok("일정이 삭제되었습니다.");
    }
}
