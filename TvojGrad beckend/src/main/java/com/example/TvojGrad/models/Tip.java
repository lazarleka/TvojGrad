package com.example.TvojGrad.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Tip {

    @JsonProperty("ID")
    private Integer ID;

    @JsonProperty("Naziv")
    private String Naziv;

    public Tip() {}

    public Tip(
            @JsonProperty("ID") Integer ID,
            @JsonProperty("Naziv") String Naziv) {
        this.ID = ID;
        this.Naziv = Naziv;
    }

    public Integer getID() { return ID; }
    public String getNaziv() { return Naziv; }
    public void setID(Integer ID) { this.ID = ID; }
    public void setNaziv(String Naziv) { this.Naziv = Naziv; }
}