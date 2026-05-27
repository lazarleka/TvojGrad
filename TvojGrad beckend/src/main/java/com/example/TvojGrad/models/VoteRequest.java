package com.example.TvojGrad.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class VoteRequest {
    @JsonProperty("KorisnikID")
    private Integer korisnikID;

    public VoteRequest() {}

    public Integer getKorisnikID() {
        return korisnikID;
    }

    public void setKorisnikID(Integer korisnikID) {
        this.korisnikID = korisnikID;
    }
}
