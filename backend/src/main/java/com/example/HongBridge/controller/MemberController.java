package com.example.HongBridge.controller;

import com.example.HongBridge.dto.auth.JwtToken;
import com.example.HongBridge.dto.auth.MemberDto;
import com.example.HongBridge.dto.auth.SignInDto;
import com.example.HongBridge.dto.auth.SignUpDto;
import com.example.HongBridge.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/login")
    public ResponseEntity<?> signIn(@RequestBody SignInDto signInDto) {
        String studentId = signInDto.getStudentId();
        String password = signInDto.getPassword();

        try {
            JwtToken jwtToken = memberService.signIn(studentId, password);
            log.info("request studentId = {}, password = {}", studentId, password);
            log.info("jwtToken accessToken = {}, refreshToken = {}", jwtToken.getAccessToken(), jwtToken.getRefreshToken());
            return ResponseEntity.ok(jwtToken); // 200 OK + JwtToken 반환
        } catch (IllegalArgumentException e) {
            log.warn("로그인 실패: {}", e.getMessage());
            return ResponseEntity
                    .status(401) // Unauthorized
                    .body(e.getMessage()); // 실패 메시지 반환
        }
    }

    @PostMapping("/test")
    public String test() {
        return "success";
    }

    @PostMapping("/register")
    public ResponseEntity<?> signUp(@RequestBody SignUpDto signUpDto) {
        try {
            log.info("SignUp 요청: {}", signUpDto);
            MemberDto savedMemberDto = memberService.signUp(signUpDto);
            log.info("저장된 결과: {}", savedMemberDto);
            return ResponseEntity.ok(savedMemberDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer", "");
        memberService.logout(token);
        return ResponseEntity.ok("로그아웃 완료");
    }

}