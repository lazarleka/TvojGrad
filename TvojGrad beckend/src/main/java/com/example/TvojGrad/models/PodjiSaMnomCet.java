package com.example.TvojGrad.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PodjiSaMnomCet {

    @JsonProperty("ID")
    private Integer ID;

    @JsonProperty("Prijava_ID")
    private Integer prijava_ID;

    @JsonProperty("Posiljalac") // Vraća cijeli objekat korisnika koji je poslao/započeo chat
    private Korisnik posiljalac;

    @JsonProperty("Primalac_ID")
    private Integer primalac_ID;

    @JsonProperty("Primalac")
    private Korisnik primalac;

    @JsonProperty("Rejting_1")
    private Double rejting_1;

    @JsonProperty("Rejting_2")
    private Double rejting_2;

    public PodjiSaMnomCet() {}

    public PodjiSaMnomCet(Integer ID, Integer prijava_ID, Korisnik posiljalac, Integer primalac_ID, Double rejting_1, Double rejting_2) {
        this.ID = ID;
        this.prijava_ID = prijava_ID;
        this.posiljalac = posiljalac;
        this.primalac_ID = primalac_ID;
        this.rejting_1 = rejting_1;
        this.rejting_2 = rejting_2;
    }

    public Integer getID() { return ID; }
    public Integer getPrijava_ID() { return prijava_ID; }
    public Korisnik getPosiljalac() { return posiljalac; }
    public Integer getPrimalac_ID() { return primalac_ID; }
    public Korisnik getPrimalac() { return primalac; }
    public Double getRejting_1() { return rejting_1; }
    public Double getRejting_2() { return rejting_2; }

    public void setID(Integer ID) { this.ID = ID; }
    public void setPrijava_ID(Integer prijava_ID) { this.prijava_ID = prijava_ID; }
    public void setPosiljalac(Korisnik posiljalac) { this.posiljalac = posiljalac; }
    public void setPrimalac_ID(Integer primalac_ID) { this.primalac_ID = primalac_ID; }
    public void setPrimalac(Korisnik primalac) { this.primalac = primalac; }
    public void setRejting_1(Double rejting_1) { this.rejting_1 = rejting_1; }
    public void setRejting_2(Double rejting_2) { this.rejting_2 = rejting_2; }
}
