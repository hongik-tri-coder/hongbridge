package com.example.HongBridge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;


import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Collection;


@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "studentId")
public class Member implements UserDetails {

    @Id
    @Column(name = "student_id", updatable = false, unique = true, nullable = false)
    private String studentId;  //학번

    @Column(nullable = false)
    private String name;  //이름

    @Column(nullable = false)
    private String password;  //비밀번호

    @Column(nullable = false)
    private Integer grade; //학년

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private Long majorId;



    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return new ArrayList<>(); // 빈 리스트 반환
    }

    @Override
    public String getUsername() {
        return this.studentId; // 학번을 아이디로 사용
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}