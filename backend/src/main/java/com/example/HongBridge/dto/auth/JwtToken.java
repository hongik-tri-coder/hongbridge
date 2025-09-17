package com.example.HongBridge.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
@AllArgsConstructor
public class JwtToken {

    private String grantType;
    //JWT에 대한 인증 타입
    private String accessToken;
    //로그인 시 필요한 토큰
    private String refreshToken;
    //accessToken 만료 후 재발급 시 필요한 토큰
}
