package com.example.HongBridge.service;

import com.example.HongBridge.entity.Member;
import com.example.HongBridge.entity.Schedule;
import com.example.HongBridge.repository.MemberRepository;
import com.example.HongBridge.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final MemberRepository memberRepository;

    public List<Schedule> getSchedulesByUser(String studentId) {
        return scheduleRepository.findByUserStudentId(studentId);
    }

    public Schedule createSchedule(Schedule schedule) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String studentId = authentication.getName();

        Member member = memberRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

        schedule.setUser(member);
        return scheduleRepository.save(schedule);
    }

    public Schedule updateSchedule(Long id, Schedule updatedSchedule) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("일정이 존재하지 않습니다."));
        schedule.setTitle(updatedSchedule.getTitle());
        schedule.setDescription(updatedSchedule.getDescription());
        schedule.setStart(updatedSchedule.getStart());
        schedule.setEnd(updatedSchedule.getEnd());
        return scheduleRepository.save(schedule);
    }

    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }
}
