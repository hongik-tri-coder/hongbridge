package com.example.HongBridge.member.service;

import com.example.HongBridge.member.dto.auth.JwtToken;
import com.example.HongBridge.member.dto.auth.MemberDto;
import com.example.HongBridge.member.dto.auth.SignUpDto;

public interface MemberService {
    JwtToken signIn(String studentId, String password);
    MemberDto signUp(SignUpDto signUpDto);
}

