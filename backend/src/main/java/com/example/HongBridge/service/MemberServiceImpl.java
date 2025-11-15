package com.example.HongBridge.service;

import com.example.HongBridge.dto.auth.JwtToken;
import com.example.HongBridge.dto.auth.MemberDto;
import com.example.HongBridge.dto.auth.SignUpDto;
import com.example.HongBridge.dto.auth.UpdateMemberDto;
import com.example.HongBridge.entity.Member;
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

    @Override
    public MemberDto getMe(String studentId) {
        return memberRepository.findByStudentId(studentId)
                .map(MemberDto::toDto)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));
    }


    @Transactional
    public MemberDto updateMember(String studentId, UpdateMemberDto dto) {

        Member member = memberRepository.findByStudentId(studentId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        // 업데이트하려는 값만 적용
        if (dto.getName() != null) member.setName(dto.getName());
        if (dto.getGrade() != null) member.setGrade(dto.getGrade());
        if (dto.getEmail() != null) member.setEmail(dto.getEmail());
        if (dto.getMajorId() != null) member.setMajorId(dto.getMajorId());

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            member.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return MemberDto.toDto(member);
    }

}
