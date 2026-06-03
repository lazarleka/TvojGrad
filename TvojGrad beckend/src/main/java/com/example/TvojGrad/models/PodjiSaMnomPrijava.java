package com.example.TvojGrad.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PodjiSaMnomPrijava {

    @JsonProperty("ID")
    private Integer ID;

    @JsonProperty("Tekst")
    private String Tekst;

    @JsonProperty("Status")
    private String Status;

    @JsonProperty("Korisnik") // Sada vraća cijeli objekat
    private Korisnik korisnik;

    @JsonProperty("Korisnik_ID")
    private Integer Korisnik_ID;

    @JsonProperty("Objava_ID")
    private Integer Objava_ID;

    @JsonProperty("Objava_Naslov")
    private String Objava_Naslov;

    public PodjiSaMnomPrijava() {}

    public PodjiSaMnomPrijava(Integer ID, String Tekst, String Status, Korisnik korisnik, Integer Objava_ID) {
        this(ID, Tekst, Status, korisnik, Objava_ID, null);
    }

    public PodjiSaMnomPrijava(Integer ID, String Tekst, String Status, Korisnik korisnik, Integer Objava_ID, String Objava_Naslov) {
        this.ID = ID;
        this.Tekst = Tekst;
        this.Status = Status;
        this.korisnik = korisnik;
        this.Korisnik_ID = korisnik != null ? korisnik.getID() : null;
        this.Objava_ID = Objava_ID;
        this.Objava_Naslov = Objava_Naslov;
    }

    public Integer getID() { return ID; }
    public String getTekst() { return Tekst; }
    public String getStatus() { return Status; }
    public Korisnik getKorisnik() { return korisnik; }
    public Integer getKorisnik_ID() { return Korisnik_ID; }
    public Integer getObjava_ID() { return Objava_ID; }
    public String getObjava_Naslov() { return Objava_Naslov; }

    public void setID(Integer ID) { this.ID = ID; }
    public void setTekst(String tekst) { this.Tekst = tekst; }
    public void setStatus(String status) { this.Status = status; }
    public void setKorisnik(Korisnik korisnik) { this.korisnik = korisnik; }
    public void setKorisnik_ID(Integer korisnik_ID) { this.Korisnik_ID = korisnik_ID; }
    public void setObjava_ID(Integer objava_ID) { this.Objava_ID = objava_ID; }
    public void setObjava_Naslov(String objava_Naslov) { this.Objava_Naslov = objava_Naslov; }
}
