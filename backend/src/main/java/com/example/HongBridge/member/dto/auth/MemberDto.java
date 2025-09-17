package com.example.HongBridge.member.dto.auth;

import com.example.HongBridge.member.entity.Member;
import lombok.*;

@Getter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemberDto {

    private String studentId;  // 학번 (PK)
    private String name;       // 이름
    private Integer grade;     // 학년
    private String email;      // 이메일
    private Long majorId;      // 전공 ID

    public static MemberDto toDto(Member member) {
        return MemberDto.builder()
                .studentId(member.getStudentId())
                .name(member.getName())
                .grade(member.getGrade())
                .email(member.getEmail())
                .majorId(member.getMajorId())
                .build();
    }

    public Member toEntity(String encodedPassword) {
        return Member.builder()
                .studentId(studentId)
                .name(name)
                .grade(grade)
                .email(email)
                .majorId(majorId)
                .password(encodedPassword) // 비밀번호는 암호화된 값 사용
                .build();
    }
}
