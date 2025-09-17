package com.example.HongBridge.service;

import com.example.HongBridge.entity.Member;
import com.example.HongBridge.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String studentId) throws UsernameNotFoundException {
        return memberRepository.findByStudentId(studentId)
                .map(this::createUserDetails)
                .orElseThrow(() -> new UsernameNotFoundException("해당 학번의 회원을 찾을 수 없습니다."));
    }

    // UserDetails 객체로 변환 (권한 없이)
    private UserDetails createUserDetails(Member member) {
        return User.builder()
                .username(member.getStudentId())
                .password(member.getPassword())
                .authorities(new ArrayList<>()) // 권한 없이 빈 리스트
                .build();
    }
}
