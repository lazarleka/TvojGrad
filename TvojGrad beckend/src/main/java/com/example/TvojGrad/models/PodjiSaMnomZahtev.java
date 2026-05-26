package com.example.TvojGrad.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PodjiSaMnomZahtev {

    @JsonProperty("ID")
    private Integer ID;

    @JsonProperty("status")
    private String status;

    @JsonProperty("PosloZahtev") // Vraća cijeli objekat korisnika koji je poslao zahtjev
    private Korisnik posloZahtev;

    @JsonProperty("PrimioZahtev")
    private Integer primioZahtev;

    public PodjiSaMnomZahtev() {}

    public PodjiSaMnomZahtev(Integer ID, String status, Korisnik posloZahtev, Integer primioZahtev) {
        this.ID = ID;
        this.status = status;
        this.posloZahtev = posloZahtev;
        this.primioZahtev = primioZahtev;
    }

    public Integer getID() { return ID; }
    public String getStatus() { return status; }
    public Korisnik getPosloZahtev() { return posloZahtev; }
    public Integer getPrimioZahtev() { return primioZahtev; }

    public void setID(Integer ID) { this.ID = ID; }
    public void setStatus(String status) { this.status = status; }
    public void setPosloZahtev(Korisnik posloZahtev) { this.posloZahtev = posloZahtev; }
    public void setPrimioZahtev(Integer primioZahtev) { this.primioZahtev = primioZahtev; }
}