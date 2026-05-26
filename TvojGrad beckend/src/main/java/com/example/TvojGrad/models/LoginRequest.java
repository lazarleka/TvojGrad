package com.example.TvojGrad.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginRequest {

    @JsonProperty("Email")
    private String Email;

    @JsonProperty("Lozinka")
    private String Lozinka;

    public LoginRequest() {}

    public String getEmail() { return Email; }
    public String getLozinka() { return Lozinka; }
    public void setEmail(String email) { this.Email = email; }
    public void setLozinka(String lozinka) { this.Lozinka = lozinka; }
}