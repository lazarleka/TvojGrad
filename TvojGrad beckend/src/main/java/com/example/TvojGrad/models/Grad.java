package com.example.TvojGrad.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Grad {

    @JsonProperty("ID")
    private Integer ID;

    @JsonProperty("Ime")
    private String Ime;

    public Grad() {}

    public Grad(
            @JsonProperty("ID") Integer ID,
            @JsonProperty("Ime") String Ime) {
        this.ID = ID;
        this.Ime = Ime;
    }

    public Integer getID() { return ID; }
    public String getIme() { return Ime; }
    public void setID(Integer ID) { this.ID = ID; }
    public void setIme(String ime) { this.Ime = ime; }
}