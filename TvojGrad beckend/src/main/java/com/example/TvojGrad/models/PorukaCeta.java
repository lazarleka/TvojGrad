package com.example.TvojGrad.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PorukaCeta {
    @JsonProperty("ID") private Integer ID;
    @JsonProperty("Cet_ID") private Integer cetID;
    @JsonProperty("Posiljalac_ID") private Integer posiljalacID;
    @JsonProperty("Posiljalac") private Korisnik posiljalac;
    @JsonProperty("Tekst") private String tekst;
    @JsonProperty("Vrijeme") private String vrijeme; // Može i String radi lakšeg slanja formata

    public PorukaCeta() {}
    public PorukaCeta(Integer ID, Integer cetID, Integer posiljalacID, String tekst, String vrijeme) {
        this.ID = ID;
        this.cetID = cetID;
        this.posiljalacID = posiljalacID;
        this.tekst = tekst;
        this.vrijeme = vrijeme;
    }

    // Getteri i Setteri
    public Integer getID() { return ID; }
    public void setID(Integer ID) { this.ID = ID; }
    public Integer getCetID() { return cetID; }
    public void setCetID(Integer cetID) { this.cetID = cetID; }
    public Integer getPosiljalacID() { return posiljalacID; }
    public void setPosiljalacID(Integer posiljalacID) { this.posiljalacID = posiljalacID; }
    public Korisnik getPosiljalac() { return posiljalac; }
    public void setPosiljalac(Korisnik posiljalac) { this.posiljalac = posiljalac; }
    public String getTekst() { return tekst; }
    public void setTekst(String tekst) { this.tekst = tekst; }
    public String getVrijeme() { return vrijeme; }
    public void setVrijeme(String vrijeme) { this.vrijeme = vrijeme; }
}
