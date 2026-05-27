package com.example.TvojGrad.controllers;

import com.example.TvojGrad.models.Korisnik;
import com.example.TvojGrad.models.LoginRequest;
import com.example.TvojGrad.services.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(value = "/auth")
public class AuthController {

    private AuthService authService = null;

    public AuthController(AuthService _authService) {
        this.authService = _authService;
    }

    // POST /auth/login
    @PostMapping(value = "/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Korisnik k = this.authService.login(loginRequest);

        if (k != null) {
            return ResponseEntity.ok(k);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Pogresan email ili lozinka");
        }
    }

    // POST /auth/register
    @PostMapping(value = "/register")
    public ResponseEntity<?> register(@RequestBody Korisnik k) {
        Korisnik noviKorisnik = this.authService.register(k);

        if (noviKorisnik != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(noviKorisnik);
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email vec postoji");
        }
    }
}