package com.example.TvojGrad.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;

public class LoginRequest {

    @JsonProperty("Email")
    @JsonAlias("email")
    private String Email;

    @JsonProperty("Lozinka")
    @JsonAlias("lozinka")
    private String Lozinka;

    public LoginRequest() {}

    public String getEmail() { return Email; }
    public String getLozinka() { return Lozinka; }
    public void setEmail(String email) { this.Email = email; }
    public void setLozinka(String lozinka) { this.Lozinka = lozinka; }
}
