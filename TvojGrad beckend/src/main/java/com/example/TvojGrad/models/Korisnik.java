package com.example.TvojGrad.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Korisnik {

    private Integer id;
    private String ime;
    private String prezime;
    private String email;
    private String tip;
    private String lozinka;
    private String profilna;

    public Korisnik() {}

    public Korisnik(Integer id, String ime, String prezime, String email, String tip, String lozinka, String profilna) {
        this.id = id;
        this.ime = ime;
        this.prezime = prezime;
        this.email = email;
        this.tip = tip;
        this.lozinka = lozinka;
        this.profilna = profilna;
    }

    // Sa @JsonProperty na geterima tačno kontrolišeš šta ide u JSON, bez dupliranja
    @JsonProperty("ID")
    public Integer getID() { return id; }

    @JsonProperty("Ime")
    public String getIme() { return ime; }

    @JsonProperty("Prezime")
    public String getPrezime() { return prezime; }

    @JsonProperty("Email")
    public String getEmail() { return email; }

    @JsonProperty("Tip")
    public String getTip() { return tip; }

    @JsonProperty("Lozinka")
    public String getLozinka() { return lozinka; }

    @JsonProperty("Profilna")
    public String getProfilna() { return profilna; }

    // Setere ostavi normalne (Jackson će znati kako da ih uveže)
    public void setID(Integer id) { this.id = id; }
    public void setIme(String ime) { this.ime = ime; }
    public void setPrezime(String prezime) { this.prezime = prezime; }
    public void setEmail(String email) { this.email = email; }
    public void setTip(String tip) { this.tip = tip; }
    public void setLozinka(String lozinka) { this.lozinka = lozinka; }
    public void setProfilna(String profilna) { this.profilna = profilna; }
}