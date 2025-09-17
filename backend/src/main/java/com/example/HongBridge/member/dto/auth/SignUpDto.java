package com.example.HongBridge.member.dto.auth;

import com.example.HongBridge.member.entity.Member;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignUpDto {

    private String studentId; // 학번
    private String name;      // 이름
    private Integer grade;    // 학년
    private String email;     // 이메일
    private Long majorId;     // 전공 ID
    private String password;  // 비밀번호

    public Member toEntity(String encodedPassword) {
        return Member.builder()
                .studentId(studentId)
                .name(name)
                .grade(grade)
                .email(email)
                .majorId(majorId)
                .password(encodedPassword)
                .build();
    }
}
