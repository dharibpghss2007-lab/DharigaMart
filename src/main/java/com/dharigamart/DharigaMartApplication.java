package com.dharigamart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DharigaMartApplication {

	public static void main(String[] args) {
		SpringApplication.run(DharigaMartApplication.class, args);
		System.out.println("============================================");
		System.out.println("  DHARIGA MART is running...");
		System.out.println("  Open http://localhost:8080  (Login page)");
		System.out.println("============================================");
	}
}