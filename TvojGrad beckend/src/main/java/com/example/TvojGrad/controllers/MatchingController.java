package com.example.TvojGrad.controllers;

import com.example.TvojGrad.services.MatchingService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/matching")
public class MatchingController {
    private final MatchingService matchingService;
    private final com.example.TvojGrad.services.GeminiInterestService geminiInterestService;

    public MatchingController(MatchingService matchingService, com.example.TvojGrad.services.GeminiInterestService geminiInterestService) {
        this.matchingService = matchingService;
        this.geminiInterestService = geminiInterestService;
    }

    @GetMapping("/{viewerId}/{candidateId}")
    public Map<String, Object> getMatching(
            @PathVariable int viewerId,
            @PathVariable int candidateId) {
        return matchingService.podudaranjeKorisnika(viewerId, candidateId);
    }

    @org.springframework.web.bind.annotation.PostMapping("/analiziraj")
    public org.springframework.http.ResponseEntity<?> analyze(@org.springframework.web.bind.annotation.RequestBody Map<String, String> body) {
        try {
            return org.springframework.http.ResponseEntity.ok(geminiInterestService.analyze(body.get("tekst")));
        } catch (IllegalStateException error) {
            return org.springframework.http.ResponseEntity.status(502).body(Map.of("greska", error.getMessage()));
        }
    }
}
