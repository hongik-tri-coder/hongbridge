package com.example.HongBridge.service;

import com.example.HongBridge.dto.auth.JwtToken;
import com.example.HongBridge.dto.auth.MemberDto;
import com.example.HongBridge.dto.auth.SignUpDto;
import com.example.HongBridge.repository.MemberRepository;
import com.example.HongBridge.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    @Override
    public JwtToken signIn(String studentId, String password) {  // username → studentId
        try {
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(studentId, password);

            Authentication authentication =
                    authenticationManagerBuilder.getObject().authenticate(authenticationToken);

            JwtToken jwtToken = jwtTokenProvider.generateToken(authentication);

            return jwtToken;
        } catch (Exception e) {
            throw new IllegalArgumentException("학번 또는 비밀번호가 올바르지 않습니다.");
        }
    }

    @Transactional
    @Override
    public MemberDto signUp(SignUpDto signUpDto) {
        if (memberRepository.existsByStudentId(signUpDto.getStudentId())) {
            throw new IllegalArgumentException("이미 사용 중인 학번입니다.");
        }

        // Password 암호화
        String encodedPassword = passwordEncoder.encode(signUpDto.getPassword());

        // roles 제거
        return MemberDto.toDto(memberRepository.save(signUpDto.toEntity(encodedPassword)));
    }

    @Override
    public void logout(String token){
        log.info("로그아웃 요청된 토큰: {}", token);
    }
}
