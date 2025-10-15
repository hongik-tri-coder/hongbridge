package com.example.HongBridge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HongBridgeApplication {
	public static void main(String[] args) {
		SpringApplication.run(HongBridgeApplication.class, args);
	}
}
