package com.example.HongBridge.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatRequest {
    @NotBlank
    private String message;

    //private String major;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    //public String getMajor() {
    //    return major;
    //}
    //public void setMajor(String major) {
     //   this.major = major;
    //}
}