package com.TvojGrad.TvojGrad;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
		"com.example.TvojGrad.controllers",
		"com.example.TvojGrad.services",
		"com.example.TvojGrad.repositories",
		"com.example.TvojGrad.models",
		"com.example.TvojGrad"
})
public class TvojGradApplication {

	public static void main(String[] args) {
		SpringApplication.run(TvojGradApplication.class, args);
	}

}
