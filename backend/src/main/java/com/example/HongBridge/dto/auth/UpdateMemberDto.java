package com.example.HongBridge.dto.auth;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateMemberDto {

    private String name;     // 변경할 이름
    private Integer grade;   // 변경할 학년
    private String email;    // 변경할 이메일
    private Long majorId;    // 변경할 전공 ID
    private String password; // 변경할 비밀번호
}
