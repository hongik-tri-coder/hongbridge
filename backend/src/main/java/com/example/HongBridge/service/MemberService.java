package com.example.HongBridge.service;

import com.example.HongBridge.dto.auth.JwtToken;
import com.example.HongBridge.dto.auth.MemberDto;
import com.example.HongBridge.dto.auth.SignUpDto;

public interface MemberService {
    JwtToken signIn(String studentId, String password);
    MemberDto signUp(SignUpDto signUpDto);

    void logout(String token);

    MemberDto getMe(String studentId);
}

