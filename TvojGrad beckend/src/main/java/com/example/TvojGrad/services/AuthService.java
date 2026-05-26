package com.example.TvojGrad.services;

import com.example.TvojGrad.models.Korisnik;
import com.example.TvojGrad.models.LoginRequest;
import com.example.TvojGrad.repositories.AuthRepositories;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private AuthRepositories authRepositories = null;

    public AuthService(AuthRepositories _authRepositories) {
        this.authRepositories = _authRepositories;
    }

    public Korisnik login(LoginRequest loginRequest) {
        return this.authRepositories.login(loginRequest);
    }

    public Korisnik register(Korisnik k) {
        return this.authRepositories.register(k);
    }
}