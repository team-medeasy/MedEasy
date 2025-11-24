package com.medeasy.alarm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class MedeasyAlarmApplication {

	public static void main(String[] args) {
		SpringApplication.run(MedeasyAlarmApplication.class, args);
	}

}
