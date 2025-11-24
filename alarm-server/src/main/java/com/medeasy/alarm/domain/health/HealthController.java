package com.medeasy.alarm.domain.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/open-api")
public class HealthController {

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
